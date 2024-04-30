import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { Tag } from '@/ui/display/tag/components/Tag';
import {
  ExpandableList,
  ExpandableListProps,
} from '@/ui/layout/expandable-list/ExpandableList';

type MultiSelectFieldDisplayProps = ExpandableListProps;
export const MultiSelectFieldDisplay = ({
  isHovered,
  reference,
  withOutline,
}: MultiSelectFieldDisplayProps) => {
  const { fieldValues, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValues
    ? fieldDefinition.metadata.options.filter((option) =>
        fieldValues.includes(option.value),
      )
    : [];

  return selectedOptions ? (
    <ExpandableList
      isHovered={isHovered}
      reference={reference}
      withOutline={withOutline}
    >
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </ExpandableList>
  ) : (
    <></>
  );
};
