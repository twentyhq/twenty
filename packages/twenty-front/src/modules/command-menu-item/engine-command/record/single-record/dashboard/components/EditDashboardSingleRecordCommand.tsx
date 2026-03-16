import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { isDefined } from 'twenty-shared/utils';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditDashboardSingleRecordCommand = () => {
  const { selectedRecord } = useEngineCommandExecutionContext();

  if (!isDefined(selectedRecord)) {
    throw new Error('Selected record is required to edit dashboard');
  }

  const pageLayoutId = selectedRecord.pageLayoutId;

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetLocationHash } = useResetLocationHash();

  const handleExecute = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
