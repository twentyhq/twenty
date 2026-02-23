import { Action } from '@/action-menu/actions/components/Action';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditRecordPageLayoutSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetLocationHash } = useResetLocationHash();

  const handleClick = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  return <Action onClick={handleClick} />;
};
