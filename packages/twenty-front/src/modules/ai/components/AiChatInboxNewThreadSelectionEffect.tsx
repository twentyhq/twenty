import { useLayoutEffect } from 'react';

import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';

export const AiChatInboxNewThreadSelectionEffect = () => {
  const { resetRecordSelection } = useResetRecordSelection();

  useLayoutEffect(() => {
    resetRecordSelection();
  }, [resetRecordSelection]);

  return null;
};
