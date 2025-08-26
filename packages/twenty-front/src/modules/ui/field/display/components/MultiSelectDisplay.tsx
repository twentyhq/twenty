import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Tag } from 'twenty-ui/components';
import { BaseMultiSelectDisplay } from 'twenty-ui/fields';
import { type SelectOption } from 'twenty-ui/input';

export const MultiSelectDisplay = ({
  values,
  options,
}: {
  values: FieldMultiSelectValue | undefined;
  options: SelectOption[];
}) => {
  const selectedOptions = values
    ? options?.filter((option) => values.includes(option.value))
    : [];

  if (!selectedOptions) return null;

  return (
    <BaseMultiSelectDisplay>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          preventShrink
          key={index}
          color={selectedOption.color ?? 'transparent'}
          text={selectedOption.label}
          Icon={selectedOption.Icon ?? undefined}
        />
      ))}
    </BaseMultiSelectDisplay>
  );
};
