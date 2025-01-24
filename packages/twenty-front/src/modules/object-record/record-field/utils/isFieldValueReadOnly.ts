import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isDefined } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type isFieldValueReadOnlyParams = {
  objectNameSingular?: string;
  fieldName?: string;
  fieldType?: FieldMetadataType;
  isObjectRemote?: boolean;
  isRecordDeleted?: boolean;
};

export const isFieldValueReadOnly = ({
  objectNameSingular,
  fieldName,
  fieldType,
  isObjectRemote = false,
  isRecordDeleted = false,
}: isFieldValueReadOnlyParams) => {
  if (fieldName === 'noteTargets' || fieldName === 'taskTargets') {
    return true;
  }

  if (isObjectRemote) {
    return true;
  }

  if (isRecordDeleted) {
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
    (isFieldActor({ type: fieldType }) || isFieldRichText({ type: fieldType }))
  ) {
    return true;
  }

  return false;
};
