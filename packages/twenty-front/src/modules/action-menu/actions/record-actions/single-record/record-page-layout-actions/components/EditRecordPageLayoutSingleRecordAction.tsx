import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutId } from '@/page-layout/hooks/useRecordPageLayoutId';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useResetLocationHash } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated/graphql';

export const EditRecordPageLayoutSingleRecordAction = () => {
  const isRecordPageLayoutEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
  );

  const recordId = useSelectedRecordIdOrThrow();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { pageLayoutId } = useRecordPageLayoutId({
    id: recordId,
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { setIsPageLayoutInEditMode } = useSetIsPageLayoutInEditMode(
    pageLayoutId ?? '',
  );

  const { resetLocationHash } = useResetLocationHash();

  const handleClick = () => {
    if (!pageLayoutId) return;
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  if (!isRecordPageLayoutEditingEnabled) {
    return null;
  }

  return <Action onClick={handleClick} />;
};
