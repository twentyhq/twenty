import { type Data } from '@dnd-kit/abstract';
import { type DragDropProvider } from '@dnd-kit/react';
import { type ComponentProps } from 'react';

type DragDropProviderProps<TData extends Data> = ComponentProps<
  typeof DragDropProvider<TData>
>;

export type DragDropProviderDragStartEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragStart']>
>[0];

export type DragDropProviderDragMoveEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragMove']>
>[0];

export type DragDropProviderDragOverEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragOver']>
>[0];

export type DragDropProviderDragEndEvent<TData extends Data> = Parameters<
  NonNullable<DragDropProviderProps<TData>['onDragEnd']>
>[0];

export type DragDropProviderDropTarget<TData extends Data> =
  DragDropProviderDragEndEvent<TData>['operation']['target'];
