import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStore';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const SaveRecordPageLayoutSingleRecordAction = () => {
  const isRecordPageLayoutEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
  );

  const recordId = useSelectedRecordIdOrThrow();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    id: recordId,
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeCommandMenu } = useCommandMenu();

  const handleClick = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      closeCommandMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  if (!isRecordPageLayoutEditingEnabled) {
    return null;
  }

  return <Action onClick={handleClick} />;
};
