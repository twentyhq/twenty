import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { BaseRatingInput } from '@/object-record/record-field/ui/meta-types/input/components/BaseRatingInput';
import { type FieldRatingValue } from '@/object-record/record-field/ui/types/FieldRatingValue';

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
