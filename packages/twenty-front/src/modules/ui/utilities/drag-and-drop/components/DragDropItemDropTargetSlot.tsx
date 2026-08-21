import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

// Zero-footprint seam between adjacent sortable cells: 2px of indicator space
// pulled 1px into each neighbor so the cells keep their layout.
const StyledDropTargetSlot = styled.div`
  align-self: stretch;
  flex: 0 0 2px;
  margin-left: -1px;
  margin-right: -1px;
  min-height: 0;
  position: relative;
  z-index: 100;
`;

type DragDropItemDropTargetSlotProps = {
  children: ReactNode;
};

export const DragDropItemDropTargetSlot = ({
  children,
}: DragDropItemDropTargetSlotProps) => (
  <StyledDropTargetSlot>{children}</StyledDropTargetSlot>
);
