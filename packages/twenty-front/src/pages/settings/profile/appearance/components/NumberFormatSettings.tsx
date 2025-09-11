// Add a new component for number format select
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { Select } from '@/ui/input/components/Select';

type NumberFormatSelectProps = {
  value: NumberFormat;
  onChange: (nextValue: NumberFormat) => void;
};

export const NumberFormatSelect = ({
  onChange,
  value,
}: NumberFormatSelectProps) => {
  return (
    <Select
      dropdownId="datetime-settings-number-format"
      label="Number format"
      fullWidth
      dropdownWidthAuto
      value={value}
      options={[
        {
          label: 'System',
          value: NumberFormat.SYSTEM,
        },
        {
          label: 'Commas and dot (1,234.56)',
          value: NumberFormat.COMMAS_AND_DOT,
        },
        {
          label: 'Spaces and comma (1 234,56)',
          value: NumberFormat.SPACES_AND_COMMA,
        },
        {
          label: 'Spaces and dot (1 234.56)',
          value: NumberFormat.SPACES_AND_DOT,
        },
      ]}
      onChange={onChange}
    />
  );
};
