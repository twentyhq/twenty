import { DragDropContext } from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';
import { useTabListStateContextOrThrow } from '../contexts/TabListStateContext';
import { TabListContentBody } from './TabListContentBody';

export const TabListContent = () => {
  const { isDragAndDropEnabled, onDragEnd } = useTabListStateContextOrThrow();

  if (isDragAndDropEnabled && isDefined(onDragEnd)) {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <TabListContentBody />
      </DragDropContext>
    );
  }

  return <TabListContentBody />;
};
