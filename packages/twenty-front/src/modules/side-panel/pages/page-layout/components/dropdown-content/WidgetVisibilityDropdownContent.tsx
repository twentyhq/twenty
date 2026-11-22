import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { getWidgetVisibilityDevice } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityDevice';
import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const handleSelectDevice = (device: WidgetVisibilityDevice) => {
    if (!isDefined(widgetInEditMode)) {
      return;
    }

    updatePageLayoutWidget(widgetInEditMode.id, {
      conditionalAvailability:
        device === 'ANY_DEVICE'
          ? null
          : buildDeviceConditionalAvailability(device),
      // TODO(@neo773): a widget holds its rule in one place, so a new tree empties the two legacy fields; stop one release after stored rules are converted to trees
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    });
  };

  return (
    <WidgetVisibilityOptionsList
      selectedDevice={getWidgetVisibilityDevice(widgetInEditMode)}
      onSelectDevice={handleSelectDevice}
    />
  );
};
