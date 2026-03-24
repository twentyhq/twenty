import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const CancelRecordPageLayoutSingleRecordCommand = () => {
  const { objectMetadataItem } = useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item is required to cancel record page layout',
    );
  }

  const recordId = useSelectedRecordIdOrThrow();

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: PageLayoutType.RECORD_PAGE,
    targetRecordIdentifier: {
      id: recordId,
      targetObjectNameSingular: objectMetadataItem.nameSingular,
    },
  });

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout({
      pageLayoutId,
      tabListInstanceId,
    });

  const handleExecute = () => {
    closeSidePanelMenu();

    resetDraftPageLayoutToPersistedPageLayout();
    setIsPageLayoutInEditMode(false);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
