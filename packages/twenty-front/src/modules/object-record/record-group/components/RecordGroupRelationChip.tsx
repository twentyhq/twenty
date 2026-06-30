import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';

type RecordGroupRelationChipProps = {
  fieldMetadataItem: FieldMetadataItem;
  recordId: string;
};

export const RecordGroupRelationChip = ({
  fieldMetadataItem,
  recordId,
}: RecordGroupRelationChipProps) => {
  const targetObjectNameSingular =
    fieldMetadataItem.relation?.targetObjectMetadata.nameSingular;

  const { record, loading } = useFindOneRecord<ObjectRecord>({
    objectNameSingular: targetObjectNameSingular ?? '',
    objectRecordId: recordId,
    withSoftDeleted: true,
    skip: !isDefined(targetObjectNameSingular),
  });

  if (
    !isDefined(targetObjectNameSingular) ||
    (!isDefined(record) && !loading)
  ) {
    return <Tag variant="outline" color="transparent" text={t`Deleted`} />;
  }

  if (!isDefined(record)) {
    return <Tag variant="outline" color="transparent" text="" />;
  }

  return (
    <RecordChip
      objectNameSingular={targetObjectNameSingular}
      record={record}
      forceDisableClick
    />
  );
};
