import { Command } from '@/command-menu-item/display/components/Command';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSaveFieldsWidgetGroups } from '@/page-layout/hooks/useSaveFieldsWidgetGroups';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';

export const SaveRecordPageLayoutSingleRecordCommand = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

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

  const handleClick = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      await saveFieldsWidgetGroups();

      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <Command onClick={handleClick} />;
};
