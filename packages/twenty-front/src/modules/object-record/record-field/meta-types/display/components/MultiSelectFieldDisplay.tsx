import { ExpandableCell } from '@/object-record/record-field/meta-types/display/components/ExpandableCell.tsx';
import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { Tag } from '@/ui/display/tag/components/Tag';

export const MultiSelectFieldDisplay = ({
  isHovered,
  reference,
}: {
  isHovered: boolean;
  reference?: HTMLDivElement;
}) => {
  const { fieldValues, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValues
    ? fieldDefinition.metadata.options.filter((option) =>
        fieldValues.includes(option.value),
      )
    : [];

  return selectedOptions ? (
    <ExpandableCell isHovered={isHovered} reference={reference}>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </ExpandableCell>
  ) : (
    <></>
  );
};
