import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

type SidePanelFormCancellationEffectProps = {
  requestId: string;
  onCancel: (params: { requestId: string }) => void;
};

export const SidePanelFormCancellationEffect = ({
  requestId,
  onCancel,
}: SidePanelFormCancellationEffectProps) => {
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  const isFormOpen =
    isSidePanelOpened &&
    sidePanelNavigationStack.some(({ pageId }) => pageId === requestId);

  useEffect(() => {
    if (!isFormOpen) {
      onCancel({ requestId });
    }
  }, [isFormOpen, onCancel, requestId]);

  return null;
};
