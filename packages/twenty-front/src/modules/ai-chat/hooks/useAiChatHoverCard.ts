import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  safePolygon,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseAiChatHoverCardParams = {
  placement: Placement;
  role: 'tooltip' | 'dialog';
  onOpen?: () => void;
  shouldStayOpen?: boolean;
  boundary?: Element | null;
};

export const useAiChatHoverCard = ({
  placement,
  role,
  onOpen,
  shouldStayOpen,
  boundary,
}: UseAiChatHoverCardParams) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open && shouldStayOpen) {
        return;
      }

      setIsOpen(open);

      if (open) {
        onOpen?.();
      }
    },
    placement,
    middleware: [
      offset(8),
      flip(),
      ...(isDefined(boundary)
        ? [
            shift({ boundary }),
            size({
              boundary,
              apply: ({ availableWidth, elements }) => {
                elements.floating.style.maxWidth = `${availableWidth}px`;
              },
            }),
          ]
        : [shift({ padding: 8 })]),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { handleClose: safePolygon() }),
    useFocus(context),
    useClick(context),
    useDismiss(context),
    useRole(context, { role }),
  ]);

  return {
    isOpen,
    close: () => setIsOpen(false),
    context,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
  };
};
