import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect } from 'react';

export const AIChatThreadsListEffect = ({ focusId }: { focusId: string }) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.SIDE_PANEL,
        instanceId: focusId,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({ focusId });
    };
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById, focusId]);

  return <></>;
};
