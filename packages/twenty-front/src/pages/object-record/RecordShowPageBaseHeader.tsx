import { FAVORITE_FOLDERS_DROPDOWN_ID } from '@/favorites/constants/FavoriteFoldersDropdownId';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageFavoriteFoldersDropdown } from '@/ui/layout/page/components/PageFavoriteFolderDropdown';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageMoreButton } from '@/ui/layout/show-page/components/ShowPageMoreButton';

type RecordShowPageBaseHeaderProps = {
  isFavorite: boolean;
  record: ObjectRecord | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectNameSingular: string;
};

export const RecordShowPageBaseHeader = ({
  isFavorite,
  record,
  objectMetadataItem,
  objectNameSingular,
}: RecordShowPageBaseHeaderProps) => {
  return (
    <>
      <PageFavoriteFoldersDropdown
        key={FAVORITE_FOLDERS_DROPDOWN_ID}
        dropdownId={FAVORITE_FOLDERS_DROPDOWN_ID}
        isFavorite={isFavorite}
        record={record}
        objectNameSingular={objectNameSingular}
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
