import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectFieldDisplay';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { Tag } from 'twenty-ui/components';

export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  if (!selectedOptions) return null;

  // When focused, show all options (no chip count). When not focused, show chip count for overflow.
  return (
    <ExpandableList isChipCountDisplayed={!isFocused}>
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
