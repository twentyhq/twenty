import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { BaseRatingInput, type FieldRatingValue } from 'twenty-ui/fields';

type RatingInputProps = {
  onChange?: (newValue: FieldRatingValue) => void;
  value: FieldRatingValue;
  readonly?: boolean;
};

export const RatingInput = ({
  onChange,
  value,
  readonly,
}: RatingInputProps) => {
  const clearField = useClearField();

  const handleChange = (newValue: FieldRatingValue) => {
    if (newValue === value) {
      clearField();
    } else {
      onChange?.(newValue);
    }
  };

  return (
    <BaseRatingInput
      value={value}
      onChange={handleChange}
      readonly={readonly}
    />
  );
};
