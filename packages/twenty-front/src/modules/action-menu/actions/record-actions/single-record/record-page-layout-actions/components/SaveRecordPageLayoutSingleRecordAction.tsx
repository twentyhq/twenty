import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useRecoilValue } from 'recoil';

export const SaveRecordPageLayoutSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
      ? DEFAULT_RECORD_PAGE_LAYOUT_ID
      : selectedRecord?.pageLayoutId;

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const handleClick = async () => {
    await savePageLayout();
    setIsPageLayoutInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};
