import { type Data } from '@dnd-kit/abstract';

import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';

export type DragDropProviderDropTarget<TData extends Data> =
  DragDropProviderDragEndEvent<TData>['operation']['target'];
