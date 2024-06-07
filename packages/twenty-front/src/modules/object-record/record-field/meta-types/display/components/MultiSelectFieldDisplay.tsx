import { styled } from '@linaria/react';
import { Tag, THEME_COMMON } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useMultiSelectFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useMultiSelectFieldDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

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

export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectFieldDisplay();

  const { isFocused } = useFieldFocus();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options?.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  if (!selectedOptions) return null;

  return isFocused ? (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </ExpandableList>
  ) : (
    <StyledContainer>
      {selectedOptions.map((selectedOption, index) => (
        <Tag
          preventShrink
          key={index}
          color={selectedOption.color}
          text={selectedOption.label}
        />
      ))}
    </StyledContainer>
  );
};
