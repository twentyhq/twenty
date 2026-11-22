import { WIDGET_VISIBILITY_DEVICES } from '@/side-panel/pages/page-layout/constants/WidgetVisibilityDevices';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';

type WidgetVisibilityOptionsListProps = {
  selectedDevice: WidgetVisibilityDevice;
  onSelectDevice: (device: WidgetVisibilityDevice) => void;
};

export const WidgetVisibilityOptionsList = ({
  selectedDevice,
  onSelectDevice,
}: WidgetVisibilityOptionsListProps) => {
  const { t } = useLingui();
  const visibilityLabels = useVisibilityLabels();

  return (
    <Dropdown.Section>
      <Dropdown.SelectionGroup
        aria-label={t`Visibility restriction`}
        value={selectedDevice}
      >
        {WIDGET_VISIBILITY_DEVICES.map((device) => (
          <Dropdown.OptionItem
            key={device}
            value={device}
            onSelect={() => onSelectDevice(device)}
          >
            {visibilityLabels[device]}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </Dropdown.Section>
  );
};
