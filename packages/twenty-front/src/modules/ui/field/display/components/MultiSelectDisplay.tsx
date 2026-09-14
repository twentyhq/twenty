import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { Tag } from 'twenty-ui/data-display';
import { type SelectOption } from 'twenty-ui/input';

const StyledContainer = styled.div<{ wrap?: boolean }>`
  align-items: center;
  display: flex;
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
  gap: 4px;
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

export const MultiSelectDisplay = ({
  values,
  options,
  wrap = false,
}: {
  values: FieldMultiSelectValue | undefined;
  options: SelectOption[];
  wrap?: boolean;
}) => {
  const selectedOptions = values
    ? options?.filter((option) => values.includes(option.value))
    : [];

  if (!isDefined(selectedOptions)) return null;

  return (
    <StyledContainer wrap={wrap}>
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
