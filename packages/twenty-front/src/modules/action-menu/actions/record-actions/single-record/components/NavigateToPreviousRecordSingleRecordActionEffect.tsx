import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';

export const NavigateToPreviousRecordSingleRecordActionEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const { navigateToPreviousRecord } = useRecordShowPagePagination(
    objectMetadataItem.nameSingular,
    recordId,
  );

  useActionEffect(() => {
    navigateToPreviousRecord();
  }, [navigateToPreviousRecord]);

  return null;
};
