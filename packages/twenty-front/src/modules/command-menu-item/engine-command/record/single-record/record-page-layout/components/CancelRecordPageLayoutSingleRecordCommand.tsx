import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isDefined } from 'twenty-shared/utils';

export const CancelRecordPageLayoutSingleRecordCommand = () => {
  const { objectMetadataItem } = useMountedEngineCommandContext();

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item is required to cancel record page layout',
    );
  }

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout(pageLayoutId);

  const handleExecute = () => {
    closeSidePanelMenu();

    resetDraftPageLayoutToPersistedPageLayout();
    setIsPageLayoutInEditMode(false);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
