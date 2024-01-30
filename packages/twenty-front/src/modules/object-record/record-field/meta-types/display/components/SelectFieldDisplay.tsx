import { Tag } from '@/ui/display/tag/components/Tag';

import { useSelectField } from '../../hooks/useSelectField';

export const SelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useSelectField();

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) => option.value === fieldValue,
  );

  return selectedOption ? (
    <Tag color={selectedOption.color} text={selectedOption.label} />
  ) : (
    <></>
  );
};
