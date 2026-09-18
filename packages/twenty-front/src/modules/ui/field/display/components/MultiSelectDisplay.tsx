import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

export const MultiSelectDisplay = ({
  values,
  options,
  className,
}: {
  values: FieldMultiSelectValue | undefined;
  options: SelectOption[];
  className?: string;
}) => {
  const selectedOptions = values
    ? options?.filter((option) => values.includes(option.value))
    : [];

  if (!isDefined(selectedOptions)) return null;

  return (
    <StyledContainer className={className}>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          preventShrink
          key={index}
          color={selectedOption.color ?? 'transparent'}
          startIcon={
            isDefined(selectedOption.Icon) ? <selectedOption.Icon /> : undefined
          }
        >
          {selectedOption.label}
        </Tag>
      ))}
    </StyledContainer>
  );
};
