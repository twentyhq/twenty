import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageFavoriteButton } from '@/ui/layout/page/components/PageFavoriteButton';
import { FavoriteFoldersDropdown } from '@/ui/layout/page/components/PageFavoriteFolderDropdown';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageMoreButton } from '@/ui/layout/show-page/components/ShowPageMoreButton';

type RecordShowPageBaseHeaderProps = {
  isFavorite: boolean;
  handleFavoriteButtonClick: () => void;
  record: ObjectRecord | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectNameSingular: string;
};

export const RecordShowPageBaseHeader = ({
  isFavorite,
  handleFavoriteButtonClick,
  record,
  objectMetadataItem,
  objectNameSingular,
}: RecordShowPageBaseHeaderProps) => {
  const dropdownId = `favorite-folders-dropdown-${record?.id ?? '0'}`;

  return (
    <>
      <FavoriteFoldersDropdown
        dropdownId={dropdownId}
        isFavorite={isFavorite}
        onRemoveFavorite={handleFavoriteButtonClick}
      />
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
