import { Action } from '@/action-menu/actions/components/Action';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';

export const CancelRecordPageLayoutSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout(pageLayoutId);

  const handleClick = () => {
    closeSidePanelMenu();

    resetDraftPageLayoutToPersistedPageLayout();
    setIsPageLayoutInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};
