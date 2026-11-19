import { useEffect } from 'react';

import { inboxListRecordSelectionInstanceIdState } from '@/inbox/states/inboxListRecordSelectionInstanceIdState';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Commands run outside the inbox tree, so they find its list selection here
export const InboxListRecordSelectionInstanceIdEffect = () => {
  const recordSelectionInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
  );
  const setInboxListRecordSelectionInstanceId = useSetAtomState(
    inboxListRecordSelectionInstanceIdState,
  );

  useEffect(() => {
    setInboxListRecordSelectionInstanceId(recordSelectionInstanceId);

    return () => setInboxListRecordSelectionInstanceId(null);
  }, [recordSelectionInstanceId, setInboxListRecordSelectionInstanceId]);

  return null;
};
