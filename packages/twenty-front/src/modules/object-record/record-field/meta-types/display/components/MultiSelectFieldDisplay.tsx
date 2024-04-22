import styled from '@emotion/styled';

import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { Tag } from '@/ui/display/tag/components/Tag';

const StyledTagContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;
export const MultiSelectFieldDisplay = () => {
  const { fieldValues, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValues
    ? fieldDefinition.metadata.options.filter((option) =>
        fieldValues.includes(option.value),
      )
    : [];

  return selectedOptions ? (
    <StyledTagContainer>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </StyledTagContainer>
  ) : (
    <></>
  );
};
