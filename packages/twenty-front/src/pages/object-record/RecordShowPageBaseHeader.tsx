import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FavoriteFoldersDropdown } from '@/ui/layout/page/components/PageFavoriteFolderDropdown';
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
  const dropdownId = `favorite-folders-dropdown`;

  return (
    <>
      <FavoriteFoldersDropdown
        dropdownId={dropdownId}
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
