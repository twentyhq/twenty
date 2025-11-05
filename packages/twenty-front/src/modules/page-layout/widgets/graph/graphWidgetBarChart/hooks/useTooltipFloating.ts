import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';

const TOOLTIP_OFFSET_PX = 2;
const TOOLTIP_BOUNDARY_PADDING_PX = 8;

export const useTooltipFloating = () => {
  const { refs, floatingStyles } = useFloating({
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(TOOLTIP_OFFSET_PX),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: document.querySelector('#root') ?? undefined,
      }),
      shift({
        boundary: document.querySelector('#root') ?? undefined,
        padding: TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return {
    refs,
    floatingStyles,
  };
};
