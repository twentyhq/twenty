import { type Data } from '@dnd-kit/abstract';
import { type DragDropProvider } from '@dnd-kit/react';
import { type ComponentProps } from 'react';

export type DragDropProviderProps<TData extends Data> = ComponentProps<
  typeof DragDropProvider<TData>
>;
