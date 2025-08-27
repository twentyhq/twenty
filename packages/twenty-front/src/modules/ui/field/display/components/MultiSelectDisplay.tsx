import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { styled } from '@linaria/react';
import { Tag } from 'twenty-ui/components';
import { type SelectOption } from 'twenty-ui/input';
import { THEME_COMMON } from 'twenty-ui/theme';

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
          Icon={selectedOption.Icon ?? undefined}
        />
      ))}
    </StyledContainer>
  );
};
