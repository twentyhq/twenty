import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { isDefined } from 'twenty-shared/utils';

type WorkflowVariableRecordObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'labelSingular' | 'nameSingular' | 'icon' | 'color' | 'isSystem'
>;

export const getWorkflowVariableRecordObjectDisplay = ({
  recordObject,
  objectMetadataItem,
  objectNameSingularsToSelect,
}: {
  recordObject: RecordOutputSchemaV2['object'];
  objectMetadataItem: WorkflowVariableRecordObjectMetadataItem | undefined;
  objectNameSingularsToSelect?: string[];
}) => ({
  label: objectMetadataItem?.labelSingular ?? recordObject.label,
  icon: objectMetadataItem?.icon ?? recordObject.icon,
  iconColor: isDefined(objectMetadataItem)
    ? getObjectColorWithFallback(objectMetadataItem)
    : undefined,
  isSelectable:
    !isDefined(objectNameSingularsToSelect) ||
    (isDefined(objectMetadataItem) &&
      objectNameSingularsToSelect.includes(objectMetadataItem.nameSingular)),
});
