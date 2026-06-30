import { type DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { type CSSProperties } from 'react';

type CssCompatibleDraggableProps = Omit<
  DraggableProvidedDraggableProps,
  'style'
> & { style?: CSSProperties };

// @hello-pangea/dnd types draggableProps.style as DraggingStyle | NotDraggingStyle —
// closed interfaces that do not satisfy the `--radix-${string}` index signature
// @radix-ui/react-popper augments onto React.CSSProperties. Widen the style so the
// props can be spread onto a styled element without a per-call-site cast.
export const getCssCompatibleDraggableProps = (
  draggableProps: DraggableProvidedDraggableProps,
): CssCompatibleDraggableProps => draggableProps as CssCompatibleDraggableProps;
