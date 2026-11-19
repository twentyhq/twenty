import { ConditionalAvailabilityOptionsSelect } from '@/conditional-availability/components/ConditionalAvailabilityOptionsSelect';
import { CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';
import { getConditionalAvailabilityDeviceLabel } from '@/conditional-availability/utils/getConditionalAvailabilityDeviceLabel';
import { useLingui } from '@lingui/react/macro';

type ConditionalAvailabilityDeviceSelectProps = {
  dropdownId: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityDeviceSelect = ({
  dropdownId,
  values,
  onChange,
}: ConditionalAvailabilityDeviceSelectProps) => {
  const { t } = useLingui();

  const options = CONDITIONAL_AVAILABILITY_DEVICES.map((device) => ({
    value: device,
    label: getConditionalAvailabilityDeviceLabel({ device }),
  }));

  return (
    <ConditionalAvailabilityOptionsSelect
      dropdownId={dropdownId}
      options={options}
      values={values}
      getUnknownValueLabel={(value) => value}
      isMultiple={false}
      searchPlaceholder={null}
      placeholder={t`Select a device`}
      onChange={onChange}
    />
  );
};
