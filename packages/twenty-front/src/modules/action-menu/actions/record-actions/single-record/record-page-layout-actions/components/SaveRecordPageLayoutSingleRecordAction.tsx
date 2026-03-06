import { Action } from '@/action-menu/actions/components/Action';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSaveFieldsWidgetGroups } from '@/page-layout/hooks/useSaveFieldsWidgetGroups';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const SaveRecordPageLayoutSingleRecordAction = () => {
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
    await saveFieldsWidgetGroups();

    const result = await savePageLayout();

    if (result.status === 'successful') {
      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <Action onClick={handleClick} />;
};
