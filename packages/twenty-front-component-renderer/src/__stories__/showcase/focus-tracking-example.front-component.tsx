import { defineFrontComponent } from 'twenty-sdk/define';
import { useState } from 'react';

type FocusReport = {
  activeElementLabel: string;
  focusHandlerActiveElementLabel: string;
};

const NO_FOCUS_LABEL = 'none';

const readActiveElementLabel = (): string =>
  document.activeElement?.getAttribute('data-focus-label') ?? NO_FOCUS_LABEL;

const FocusTrackingComponent = () => {
  const [focusReport, setFocusReport] = useState<FocusReport>({
    activeElementLabel: NO_FOCUS_LABEL,
    focusHandlerActiveElementLabel: NO_FOCUS_LABEL,
  });

  const reportActiveElement = () =>
    setFocusReport((previousFocusReport) => ({
      ...previousFocusReport,
      activeElementLabel: readActiveElementLabel(),
    }));

  return (
    <div
      data-testid="focus-tracking-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <div
        role="tablist"
        data-focus-label="tab-list"
        onFocus={reportActiveElement}
        onBlur={reportActiveElement}
      >
        <button
          role="tab"
          data-testid="focus-tracking-first-tab"
          data-focus-label="first-tab"
          onFocus={() =>
            setFocusReport({
              activeElementLabel: readActiveElementLabel(),
              focusHandlerActiveElementLabel: readActiveElementLabel(),
            })
          }
        >
          First tab
        </button>
        <button
          role="tab"
          data-testid="focus-tracking-second-tab"
          data-focus-label="second-tab"
        >
          Second tab
        </button>
      </div>
      <p
        data-testid="focus-tracking-status"
        data-active-element={focusReport.activeElementLabel}
        data-focus-handler-active-element={
          focusReport.focusHandlerActiveElementLabel
        }
      >
        Active element: {focusReport.activeElementLabel}
      </p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000115',
  name: 'focus-tracking-component',
  description:
    'Asserts document.activeElement follows the page focus inside the sandbox worker',
  component: FocusTrackingComponent,
});
