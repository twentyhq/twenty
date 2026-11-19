import { ConditionalAvailabilityOptionsSelect } from '@/conditional-availability/components/ConditionalAvailabilityOptionsSelect';
import { CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
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
  const { isReadOnly } = useConditionalAvailabilityEditorContext();

  const options = CONDITIONAL_AVAILABILITY_DEVICES.map((device) => ({
    value: device,
    label: getConditionalAvailabilityDeviceLabel({ device }),
  }));

  const getValueLabel = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <ConditionalAvailabilityOptionsSelect
      dropdownId={dropdownId}
      options={options}
      values={values}
      getValueLabel={getValueLabel}
      isMultiple={false}
      searchPlaceholder={null}
      placeholder={t`Select a device`}
      isDisabled={isReadOnly}
      isLoading={false}
      onChange={onChange}
    />
  );
};
