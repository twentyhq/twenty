import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { DragDropContext } from '@hello-pangea/dnd';
import { type ReactNode } from 'react';

type PageLayoutTabsDragProviderProps = {
  children: ReactNode;
  pageLayoutId: string;
};

export const PageLayoutTabsDragProvider = ({
  children,
  pageLayoutId,
}: PageLayoutTabsDragProviderProps) => {
  const { handleReorderTabs } = useReorderPageLayoutTabs(pageLayoutId);

  return (
    <DragDropContext onDragEnd={handleReorderTabs}>{children}</DragDropContext>
  );
};
