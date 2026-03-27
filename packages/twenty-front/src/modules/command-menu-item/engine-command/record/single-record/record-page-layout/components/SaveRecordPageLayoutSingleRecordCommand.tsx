import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSavePageLayoutWidgetsData } from '@/page-layout/hooks/useSavePageLayoutWidgetsData';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isDefined } from 'twenty-shared/utils';

export const SaveRecordPageLayoutSingleRecordCommand = () => {
  const { objectMetadataItem } = useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item is required to save record page layout',
    );
  }

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { savePageLayoutWidgetsData } = useSavePageLayoutWidgetsData();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleExecute = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      await savePageLayoutWidgetsData(pageLayoutId);

      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
