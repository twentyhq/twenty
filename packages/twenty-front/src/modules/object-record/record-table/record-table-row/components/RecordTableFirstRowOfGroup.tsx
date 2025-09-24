import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isActive } from '@tiptap/core';
import { forwardRef, type ReactNode } from 'react';

type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  focusIndex: number;
  isDragging?: boolean;
  isRowFocusActive: boolean;
  isFocused: boolean;
  isNextRowActiveOrFocused: boolean;
} & Omit<
  React.ComponentProps<typeof RecordTableRowDiv>,
  'isActive' | 'isNextRowActiveOrFocused' | 'isFocused'
>;

export const RecordTableFirstRowOfGroup = forwardRef<
  HTMLDivElement,
  RecordTableTrProps
>(
  (
    {
      children,
      recordId,
      isNextRowActiveOrFocused,
      isDragging = false,
      isRowFocusActive,
      isFocused,
      ...props
    },
    ref,
  ) => {
    const isScrolledVertically = useRecoilComponentValue(
      isRecordTableScrolledVerticallyComponentState,
    );

    return (
      <RecordTableRowDiv
        className="table-row"
        data-virtualized-id={recordId}
        isDragging={isDragging}
        ref={ref}
        data-active={isActive}
        data-focused={isRowFocusActive && isFocused && !isActive}
        data-next-row-active-or-focused={isNextRowActiveOrFocused}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        isScrolledVertically={isScrolledVertically}
        isFirstRowOfGroup={true}
      >
        {children}
      </RecordTableRowDiv>
    );
  },
);
