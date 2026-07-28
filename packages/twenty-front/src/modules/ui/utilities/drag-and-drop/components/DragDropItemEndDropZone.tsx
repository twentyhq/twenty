import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { DragDropItemDropLine } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropLine';

const StyledEndDropZone = styled.div`
  position: relative;
`;

type DragDropItemEndDropZoneProps = {
  id: string;
  accept: string;
  data: Record<string, unknown>;
  dropLine?: 'horizontal' | 'vertical';
  className?: string;
  children?: ReactNode;
};

// Catches drops after the last sortable item of a list, or into an empty
// list, where there is no item cell to target. Style with styled(...) to give
// the zone its layout footprint.
export const DragDropItemEndDropZone = ({
  id,
  accept,
  data,
  dropLine = 'horizontal',
  className,
  children,
}: DragDropItemEndDropZoneProps) => {
  const { ref, isDropTarget } = useDroppable({
    id,
    accept,
    collisionDetector: pointerIntersection,
    data,
  });

  return (
    <StyledEndDropZone ref={ref} className={className}>
      {isDropTarget && <DragDropItemDropLine orientation={dropLine} />}
      {children}
    </StyledEndDropZone>
  );
};
