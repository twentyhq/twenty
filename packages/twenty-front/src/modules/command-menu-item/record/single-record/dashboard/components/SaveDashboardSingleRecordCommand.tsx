import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSavePageLayoutWidgetsData } from '@/page-layout/hooks/useSavePageLayoutWidgetsData';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const SaveDashboardSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const pageLayoutId = recordStore?.pageLayoutId;

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { savePageLayoutWidgetsData } = useSavePageLayoutWidgetsData();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleClick = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      await savePageLayoutWidgetsData(pageLayoutId);
      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <Command onClick={handleClick} />;
};
