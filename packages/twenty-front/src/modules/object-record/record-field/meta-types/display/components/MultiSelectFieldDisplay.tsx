import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconPencil } from 'twenty-ui';

import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { Chip, ChipVariant } from '@/ui/display/chip/components/Chip.tsx';
import { Tag } from '@/ui/display/tag/components/Tag';
import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton.tsx';

const StyledTagContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledChipContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledWrapper = styled.div`
  gap: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const MultiSelectFieldDisplay = () => {
  const { fieldValues, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValues
    ? fieldDefinition.metadata.options.filter((option) =>
        fieldValues.includes(option.value),
      )
    : [];
  const newSet = new Set<number>();
  for (let i = 0; i < selectedOptions.length; i++) {
    newSet.add(i);
  }
  const [setItemsInView, setListItemsInView] = useState(newSet);

  const rootRef = useRef<HTMLDivElement>(null);

  const getShrink = (index: number) => {
    return index > setItemsInView.size - 2 ? 1 : 0;
  };

  const computeRemainingOptions = () => {
    return selectedOptions.length - setItemsInView.size;
  };

  return selectedOptions ? (
    <StyledWrapper>
      <StyledTagContainer>
        {selectedOptions.map((selectedOption, index) => {
          return (
            setItemsInView.has(index) && (
              <Tag
                key={index}
                color={selectedOption.color}
                text={selectedOption.label}
                set={setListItemsInView}
                id={index}
                rootRef={rootRef}
                shrink={getShrink(index)}
              />
            )
          );
        })}
      </StyledTagContainer>
      <StyledChipContainer>
        {computeRemainingOptions() > 0 && (
          <Chip
            label={`+${computeRemainingOptions()}`}
            variant={ChipVariant.Highlighted}
          />
        )}
        <FloatingIconButton Icon={IconPencil} />
      </StyledChipContainer>
    </StyledWrapper>
  ) : (
    <></>
  );
};
