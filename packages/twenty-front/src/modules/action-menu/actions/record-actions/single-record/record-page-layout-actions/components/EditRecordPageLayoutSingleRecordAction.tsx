import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { DEFAULT_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPageLayoutId';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useRecoilValue } from 'recoil';

export const EditRecordPageLayoutSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  // For COMPANY objects, use DEFAULT_PAGE_LAYOUT_ID
  // For other objects, use the record's pageLayoutId (when backend is ready)
  const pageLayoutId =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
      ? DEFAULT_PAGE_LAYOUT_ID
      : selectedRecord?.pageLayoutId;

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const handleClick = () => {
    setIsPageLayoutInEditMode(true);
  };

  return <Action onClick={handleClick} />;
};
