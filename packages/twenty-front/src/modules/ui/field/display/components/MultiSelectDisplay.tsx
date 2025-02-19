import { Tag, THEME_COMMON } from 'twenty-ui';

import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { SelectOption } from '@/spreadsheet-import/types';
import styled from '@emotion/styled';

const spacing1 = THEME_COMMON.spacing(1);

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing1};
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

export const MultiSelectDisplay = ({
  values,
  options,
}: {
  values: FieldMultiSelectValue | undefined;
  options: SelectOption[];
}) => {
  const selectedOptions = values
    ? options?.filter((option) => values.includes(option.value))
    : [];

  if (!selectedOptions) return null;

  return (
    <StyledContainer>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          preventShrink
          key={index}
          color={selectedOption.color ?? 'transparent'}
          text={selectedOption.label}
          Icon={selectedOption.icon ?? undefined}
        />
      ))}
    </StyledContainer>
  );
};
