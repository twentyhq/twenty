import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WIDGET_VISIBILITY_DEVICES } from '@/side-panel/pages/page-layout/constants/WidgetVisibilityDevices';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { getWidgetVisibilityDevice } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityDevice';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { buildDeviceConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type WidgetVisibilityOptionsListProps = {
  pageLayoutId: string;
  widget:
    | Pick<
        PageLayoutWidget,
        'id' | 'conditionalAvailabilityExpression' | 'conditionalAvailability'
      >
    | undefined;
};

export const WidgetVisibilityOptionsList = ({
  pageLayoutId,
  widget,
}: WidgetVisibilityOptionsListProps) => {
  const { t } = useLingui();
  const visibilityLabels = useVisibilityLabels();
  const isWidgetConditionalAvailabilityEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED,
  );

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const handleSelectDevice = (device: WidgetVisibilityDevice) => {
    if (!isDefined(widget)) {
      return;
    }

    updatePageLayoutWidget(widget.id, {
      conditionalAvailability:
        device === 'ANY_DEVICE'
          ? null
          : buildDeviceConditionalEvaluationNode(device),
      // TODO(@neo773): a widget holds its rule in one place, so a new tree empties the two legacy fields; stop one release after stored rules are converted to trees
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    });
  };

  return (
    <Dropdown.Section>
      <Dropdown.SelectionGroup
        aria-label={t`Visibility restriction`}
        value={getWidgetVisibilityDevice({
          widget,
          isWidgetConditionalAvailabilityEnabled,
        })}
      >
        {WIDGET_VISIBILITY_DEVICES.map((device) => (
          <Dropdown.OptionItem
            key={device}
            value={device}
            onSelect={() => handleSelectDevice(device)}
          >
            {visibilityLabels[device]}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </Dropdown.Section>
  );
};
