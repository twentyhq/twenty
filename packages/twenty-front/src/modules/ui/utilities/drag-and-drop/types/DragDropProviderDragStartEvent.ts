import { type Data } from '@dnd-kit/abstract';

import { type DragDropProviderProps } from '@/ui/utilities/drag-and-drop/types/DragDropProviderProps';

export type DragDropProviderDragStartEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragStart']>
>[0];
