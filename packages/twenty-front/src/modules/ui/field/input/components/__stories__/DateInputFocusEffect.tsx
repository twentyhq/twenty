import { useEffect } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

type DateInputFocusEffectProps = {
  instanceId: string;
};

export const DateInputFocusEffect = ({
  instanceId,
}: DateInputFocusEffectProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId,
      },
    });
  }, [instanceId, pushFocusItemToFocusStack]);

  return null;
};
