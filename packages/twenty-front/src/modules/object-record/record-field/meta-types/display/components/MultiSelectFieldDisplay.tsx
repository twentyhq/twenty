import { Tag } from 'twenty-ui';

import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

type MultiSelectFieldDisplayProps = {
  isCellSoftFocused?: boolean;
  cellElement?: HTMLElement;
  fromTableCell?: boolean;
};

export const MultiSelectFieldDisplay = ({
  isCellSoftFocused,
  cellElement,
  fromTableCell,
}: MultiSelectFieldDisplayProps) => {
  const { fieldValues, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValues
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValues.includes(option.value),
      )
    : [];

  if (!selectedOptions) return null;

  return (
    <ExpandableList
      anchorElement={cellElement}
      isChipCountDisplayed={isCellSoftFocused}
      withExpandedListBorder={fromTableCell}
    >
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
