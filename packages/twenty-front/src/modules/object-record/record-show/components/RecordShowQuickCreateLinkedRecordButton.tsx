import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { findManyToOneRelationFieldToObject } from '@/object-record/record-show/utils/findManyToOneRelationFieldToObject';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type RecordShowQuickCreateLinkedRecordButtonProps = {
  linkedObjectMetadataItem: EnrichedObjectMetadataItem;
  targetObjectMetadataId: string;
  targetRecordId: string;
};

export const RecordShowQuickCreateLinkedRecordButton = ({
  linkedObjectMetadataItem,
  targetObjectMetadataId,
  targetRecordId,
}: RecordShowQuickCreateLinkedRecordButtonProps) => {
  const relationField = findManyToOneRelationFieldToObject({
    fields: linkedObjectMetadataItem.fields,
    targetObjectMetadataId,
  });

  const objectPermissions = useObjectPermissionsForObject(
    linkedObjectMetadataItem.id,
  );

  const { createNewRecord } = useCreateNewRecord({
    objectMetadataItem: linkedObjectMetadataItem,
    buildRecordInput: () =>
      isDefined(relationField)
        ? { [`${relationField.name}Id`]: targetRecordId }
        : {},
  });

  const canCreate = canCreateRecordsForObjectMetadataItem({
    objectPermissions,
    objectMetadataItem: linkedObjectMetadataItem,
  });

  if (!isDefined(relationField) || !canCreate) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="outline"
      startIcon={<IconPlus />}
      onClick={() => createNewRecord()}
    >
      {linkedObjectMetadataItem.labelSingular}
    </Button>
  );
};
