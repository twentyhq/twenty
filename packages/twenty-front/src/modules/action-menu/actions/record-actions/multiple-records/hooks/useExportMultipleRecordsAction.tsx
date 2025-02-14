import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { useExportRecords } from '@/object-record/record-index/export/hooks/useExportRecords';

export const useExportMultipleRecordsAction = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { download } = useExportRecords({
    delayMs: 100,
    objectMetadataItem,
    recordIndexId: objectMetadataItem.namePlural,
    filename: `${objectMetadataItem.nameSingular}.csv`,
  });

  const onClick = async () => {
    await download();
  };

  return {
    shouldBeRegistered: true,
    onClick,
  };
};
