import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isFieldRichTextV2 } from '@/object-record/record-field/types/guards/isFieldRichTextV2';
import { isDefined } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type isFieldValueReadOnlyParams = {
  objectNameSingular?: string;
  fieldName?: string;
  fieldType?: FieldMetadataType;
  isObjectRemote?: boolean;
  isRecordDeleted?: boolean;
  hasObjectReadOnlyPermission?: boolean;
  contextStoreCurrentViewType: ContextStoreViewType | null;
};

export const isFieldValueReadOnly = ({
  objectNameSingular,
  fieldName,
  fieldType,
  isObjectRemote = false,
  isRecordDeleted = false,
  hasObjectReadOnlyPermission = false,
  contextStoreCurrentViewType,
}: isFieldValueReadOnlyParams) => {
  const isTableViewOrKanbanView =
    contextStoreCurrentViewType === ContextStoreViewType.Table ||
    contextStoreCurrentViewType === ContextStoreViewType.Kanban;

  const isTargetField =
    fieldName === 'noteTargets' || fieldName === 'taskTargets';

  if (isTableViewOrKanbanView && isTargetField) {
    return true;
  }

  if (isObjectRemote) {
    return true;
  }

  if (isRecordDeleted) {
    return true;
  }

  if (hasObjectReadOnlyPermission) {
    return true;
  }

  if (isWorkflowSubObjectMetadata(objectNameSingular)) {
    return true;
  }

  if (objectNameSingular === CoreObjectNameSingular.CalendarEvent) {
    return true;
  }

  if (
    objectNameSingular === CoreObjectNameSingular.Workflow &&
    fieldName !== 'name'
  ) {
    return true;
  }

  if (
    isDefined(fieldType) &&
    (isFieldActor({ type: fieldType }) ||
      isFieldRichText({ type: fieldType }) ||
      isFieldRichTextV2({ type: fieldType }))
  ) {
    return true;
  }

  return false;
};
