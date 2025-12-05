import { GRAPH_TOOLTIP_BOUNDARY_PADDING_PX } from '@/page-layout/widgets/graph/constants/GraphTooltipBoundaryPaddingPx';
import { createVirtualElementFromSVGElement } from '@/page-layout/widgets/graph/utils/createVirtualElementFromSVGElement';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type VirtualElement,
} from '@floating-ui/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useGraphWidgetTooltipFloating = (
  element: Element | VirtualElement | null,
  boundaryElement: Element | null | undefined,
  tooltipOffsetFromAnchorInPx: number,
) => {
  const virtualElement = useMemo(() => {
    if (!isDefined(element)) return null;
    if (element instanceof Element) {
      return createVirtualElementFromSVGElement(element);
    }
    return element;
  }, [element]);

  const rootBoundary =
    typeof document !== 'undefined'
      ? document.querySelector('#root') ?? undefined
      : undefined;

  const { refs, x, y, isPositioned } = useFloating({
    elements: {
      reference: virtualElement,
    },
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(tooltipOffsetFromAnchorInPx),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: boundaryElement ?? rootBoundary,
      }),
      shift({
        boundary: boundaryElement ?? rootBoundary,
        padding: GRAPH_TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return { refs, x, y, isPositioned };
};
