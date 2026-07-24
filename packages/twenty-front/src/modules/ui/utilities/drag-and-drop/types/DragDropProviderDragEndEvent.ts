import { type Data } from '@dnd-kit/abstract';

import { type DragDropProviderProps } from '@/ui/utilities/drag-and-drop/types/DragDropProviderProps';

export type DragDropProviderDragEndEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragEnd']>
>[0];
