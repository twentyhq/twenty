import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectFieldDisplay';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { Tag } from 'twenty-ui/components';
import { isDefined } from 'twenty-shared/utils';

export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const fieldValueAsArray = Array.isArray(fieldValue) ? fieldValue : [];

  const selectedOptions = fieldDefinition.metadata.options?.filter((option) =>
    fieldValueAsArray.includes(option.value),
  );

  if (!isDefined(selectedOptions)) return null;

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
      values={fieldValueAsArray}
      options={fieldDefinition.metadata.options}
    />
  );
};
