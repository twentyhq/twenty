import { useLoadRecordInStore } from '@/object-record/record-store/hooks/useLoadRecordInStore';

type RecordDetailRelationRecordsListItemEffectProps = {
  relationRecordId: string;
  relationObjectMetadataNameSingular: string;
};

export const RecordDetailRelationRecordsListItemEffect = ({
  relationRecordId,
  relationObjectMetadataNameSingular,
}: RecordDetailRelationRecordsListItemEffectProps) => {
  useLoadRecordInStore({
    objectNameSingular: relationObjectMetadataNameSingular,
    recordId: relationRecordId,
  });

  return null;
};
