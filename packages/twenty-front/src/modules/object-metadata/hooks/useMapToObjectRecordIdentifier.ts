import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useMapToObjectRecordIdentifier = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const mapToObjectRecordIdentifier = (record: ObjectRecord) => {
    return getObjectRecordIdentifier({ objectMetadataItem, record });
  };

  return { mapToObjectRecordIdentifier };
};
