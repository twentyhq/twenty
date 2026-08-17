import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MAX_STACK_CARDS = 5;

const StyledRecordDragMultiDragStackCard = styled.div<{ offset: number }>`
  background-color: ${themeCssVariables.accent.tertiary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: ${({ offset }) => (offset === 1 ? 2 : (offset - 1) * 4 + 2)}px;
  z-index: ${({ offset }) => -offset};
`;

export const RecordDragMultiDragStack = () => {
  const originalDragSelection = useAtomComponentStateValue(
    originalDragSelectionComponentState,
  );

  const shouldShow = originalDragSelection.length > 1;

  if (!shouldShow) {
    return null;
  }

  return Array.from({
    length: Math.min(MAX_STACK_CARDS, originalDragSelection.length - 1),
  }).map((_, index) => (
    <StyledRecordDragMultiDragStackCard key={index} offset={index + 1} />
  ));
};
