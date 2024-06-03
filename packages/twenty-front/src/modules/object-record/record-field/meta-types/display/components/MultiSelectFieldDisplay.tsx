import { Tag } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

export const MultiSelectFieldDisplay = () => {
  const { fieldValues, fieldDefinition } = useMultiSelectField();

  const { isFocused } = useFieldFocus();

  const selectedOptions = fieldValues
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValues.includes(option.value),
      )
    : [];

  if (!selectedOptions) return null;

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </ExpandableList>
  );
};
