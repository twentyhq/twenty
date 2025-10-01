import { TabListContentBody } from '@/ui/layout/tab-list/components/TabListContentBody';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';
import { DragDropContext } from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';

export const TabListContent = () => {
  const { isDragAndDropEnabled, onDragEnd } = useTabListContextOrThrow();

  if (isDragAndDropEnabled && isDefined(onDragEnd)) {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <TabListContentBody />
      </DragDropContext>
    );
  }

  return <TabListContentBody />;
};
