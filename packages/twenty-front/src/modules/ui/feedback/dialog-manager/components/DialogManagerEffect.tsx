import { useEffect } from 'react';

import { DIALOG_FOCUS_ID } from '@/ui/feedback/dialog-manager/constants/DialogFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

import { dialogInternalComponentState } from '@/ui/feedback/dialog-manager/states/dialogInternalComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const DialogManagerEffect = () => {
  const dialogInternal = useRecoilComponentValue(dialogInternalComponentState);

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    if (dialogInternal.queue.length === 0) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId: DIALOG_FOCUS_ID,
      component: {
        type: FocusComponentType.DIALOG,
        instanceId: DIALOG_FOCUS_ID,
      },
    });
  }, [dialogInternal.queue, pushFocusItemToFocusStack]);

  return <></>;
};
