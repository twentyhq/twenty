import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

const StyledRecordBoardCardStackCard = styled.div<{ offset: number }>`
  position: absolute;
  top: ${({ offset }) => (offset === 1 ? 2 : (offset - 1) * 4 + 2)}px;
  left: 0;
  right: 0;
  height: 100%;
  background-color: ${({ theme }) => theme.accent.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  z-index: ${({ offset }) => -offset};
`;

export const RecordBoardCardMultiDragStack = () => {
  const originalDragSelection = useRecoilComponentValue(
    originalDragSelectionComponentState,
  );

  const selectedCount = originalDragSelection.length ?? 0;

  const shouldShow = selectedCount > 1;

  if (!shouldShow) {
    return null;
  }

  return Array.from({
    length: Math.min(5, originalDragSelection.length - 1),
  }).map((_, index) => (
    <StyledRecordBoardCardStackCard key={index} offset={index + 1} />
  ));
};
