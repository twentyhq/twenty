import { TextInput } from '@/ui/input/components/TextInput';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type CommandMenuItemNumberInputProps = {
  value: string;
  onChange: (value: number | null) => void;
  placeholder?: string;
};

export const CommandMenuItemNumberInput = ({
  value,
  onChange,
  placeholder,
}: CommandMenuItemNumberInputProps) => {
  const handleChange = (text: string) => {
    const numericValue = isNonEmptyString(text) ? parseFloat(text) : null;
    onChange(numericValue);
  };

  const handleBlur = () => {
    const trimmedValue = value.trim();

    if (!isNonEmptyString(trimmedValue)) {
      onChange(null);
      return;
    }

    const numericValue = parseFloat(trimmedValue);

    if (!isDefined(numericValue) || !isNaN(numericValue)) {
      onChange(numericValue);
    } else {
      onChange(null);
    }
  };

  return (
    <TextInput
      type="number"
      value={value}
      sizeVariant="sm"
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};
