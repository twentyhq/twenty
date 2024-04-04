import styled from '@emotion/styled';

import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField.ts';
import { Tag } from '@/ui/display/tag/components/Tag';

const StyledTagContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;
export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  return selectedOptions ? (
    <StyledTagContainer>
      {selectedOptions.map((selectedOption) => (
        <Tag color={selectedOption.color} text={selectedOption.label} />
      ))}
    </StyledTagContainer>
  ) : (
    <></>
  );
};
