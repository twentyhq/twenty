import { RefObject } from 'react';
import {
  boxesIntersect,
  useSelectionContainer,
} from '@air/react-drag-to-select';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { tableRowIdsState } from '../states/tableRowIdsState';

type OwnProps = {
  tableBodyRef: RefObject<HTMLDivElement>;
  entityTableBodyRef: RefObject<HTMLTableSectionElement>;
};

export function EntityTableDragSelect({
  tableBodyRef,
  entityTableBodyRef,
}: OwnProps) {
  const rowIds = useRecoilValue(tableRowIdsState);

  const setRowSelectedState = useRecoilCallback(
    ({ set }) =>
      (rowId: string, selected: boolean) => {
        set(isRowSelectedFamilyState(rowId), selected);
      },
  );

  const { DragSelection } = useSelectionContainer({
    eventsElement: tableBodyRef.current,
    onSelectionStart: () => {
      Array.from(entityTableBodyRef.current?.children ?? []).forEach(
        (item, index) => {
          setRowSelectedState(rowIds[index], false);
        },
      );
    },
    onSelectionChange: (box) => {
      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
      };
      Array.from(entityTableBodyRef.current?.children ?? []).forEach(
        (item, index) => {
          if (boxesIntersect(scrollAwareBox, item.getBoundingClientRect())) {
            setRowSelectedState(rowIds[index], true);
          } else {
            setRowSelectedState(rowIds[index], false);
          }
        },
      );
    },
    selectionProps: {
      style: {
        border: '1px solid #4C85D8',
        background: 'rgba(155, 193, 239, 0.4)',
        position: `absolute`,
        zIndex: 99,
      },
    },
  });

  return <DragSelection />;
}
