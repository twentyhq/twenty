import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageFavoriteButton } from '@/ui/layout/page/PageFavoriteButton';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageMoreButton } from '@/ui/layout/show-page/components/ShowPageMoreButton';

export const RecordShowPageBaseHeader = ({
  isFavorite,
  handleFavoriteButtonClick,
  record,
  objectMetadataItem,
  objectNameSingular,
}: {
  isFavorite: boolean;
  handleFavoriteButtonClick: () => void;
  record: ObjectRecord | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectNameSingular: string;
}) => {
  return (
    <>
      <PageFavoriteButton
        isFavorite={isFavorite}
        onClick={handleFavoriteButtonClick}
      />
      <ShowPageAddButton
        key="add"
        activityTargetObject={{
          id: record?.id ?? '0',
          targetObjectNameSingular: objectMetadataItem.nameSingular,
        }}
      />
      <ShowPageMoreButton
        key="more"
        recordId={record?.id ?? '0'}
        objectNameSingular={objectNameSingular}
      />
    </>
  );
};
