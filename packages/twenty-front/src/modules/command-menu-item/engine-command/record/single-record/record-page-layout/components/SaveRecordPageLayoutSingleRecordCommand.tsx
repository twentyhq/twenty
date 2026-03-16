import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSaveFieldsWidgetGroups } from '@/page-layout/hooks/useSaveFieldsWidgetGroups';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isDefined } from 'twenty-shared/utils';

export const SaveRecordPageLayoutSingleRecordCommand = () => {
  const { objectMetadataItem } = useEngineCommandExecutionContext();

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item is required to save record page layout',
    );
  }

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { saveFieldsWidgetGroups } = useSaveFieldsWidgetGroups({
    pageLayoutId,
  });

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleExecute = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      await saveFieldsWidgetGroups();

      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
