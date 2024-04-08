import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useMapToObjectRecordIdentifier = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const mapToObjectRecordIdentifier = (record: ObjectRecord) => {
    return getObjectRecordIdentifier({ objectMetadataItem, record });
  };

  return { mapToObjectRecordIdentifier };
};
