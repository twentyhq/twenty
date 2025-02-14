import { Tag } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useMultiSelectFieldDisplay';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  if (!selectedOptions) return null;

  return isFocused ? (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </ExpandableList>
  ) : (
    <MultiSelectDisplay
      values={fieldValue}
      options={fieldDefinition.metadata.options}
    />
  );
};
