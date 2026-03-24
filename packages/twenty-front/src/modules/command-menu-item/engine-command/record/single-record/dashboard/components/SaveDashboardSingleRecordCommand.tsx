import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isDefined } from 'twenty-shared/utils';

export const SaveDashboardSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord)) {
    throw new Error('Selected record is required to save dashboard');
  }

  const pageLayoutId = selectedRecord.pageLayoutId;

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleExecute = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
