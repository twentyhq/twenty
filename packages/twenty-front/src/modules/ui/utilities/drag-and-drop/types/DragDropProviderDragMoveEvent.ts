import { type Data } from '@dnd-kit/abstract';

import { type DragDropProviderProps } from '@/ui/utilities/drag-and-drop/types/DragDropProviderProps';

export type DragDropProviderDragMoveEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragMove']>
>[0];
