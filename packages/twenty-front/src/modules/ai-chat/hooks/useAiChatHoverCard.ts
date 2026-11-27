import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useState } from 'react';

type UseAiChatHoverCardParams = {
  placement: Placement;
  role: 'tooltip' | 'dialog';
  onOpen?: () => void;
};

export const useAiChatHoverCard = ({
  placement,
  role,
  onOpen,
}: UseAiChatHoverCardParams) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open);

      if (open) {
        onOpen?.();
      }
    },
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
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
    context,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
  };
};
