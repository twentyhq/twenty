import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

type RecordCreationFormCancellationEffectProps = {
  requestId: string;
  onCancel: (params: { requestId: string }) => void;
};

export const RecordCreationFormCancellationEffect = ({
  requestId,
  onCancel,
}: RecordCreationFormCancellationEffectProps) => {
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  const isRecordCreationFormOpen =
    isSidePanelOpened &&
    sidePanelNavigationStack.some(({ pageId }) => pageId === requestId);

  useEffect(() => {
    if (!isRecordCreationFormOpen) {
      onCancel({ requestId });
    }
  }, [isRecordCreationFormOpen, onCancel, requestId]);

  return null;
};
