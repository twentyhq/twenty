import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetVisibilityOptionsList } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityOptionsList';
import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';

type SingleWidgetTabVisibilityDropdownContentProps = {
  widgetId: string;
  selectedDevice: WidgetVisibilityDevice;
  pageLayoutId: string;
};

export const SingleWidgetTabVisibilityDropdownContent = ({
  widgetId,
  selectedDevice,
  pageLayoutId,
}: SingleWidgetTabVisibilityDropdownContentProps) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const handleSelectDevice = (device: WidgetVisibilityDevice) => {
    updatePageLayoutWidget(widgetId, {
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
      selectedDevice={selectedDevice}
      onSelectDevice={handleSelectDevice}
    />
  );
};
