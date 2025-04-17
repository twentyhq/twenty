import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';

import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type isFieldValueReadOnlyParams = {
  objectNameSingular?: string;
  fieldName?: string;
  fieldType?: FieldMetadataType;
  isRecordReadOnly?: boolean;
  isCustom?: boolean;
};

export const isFieldValueReadOnly = ({
  objectNameSingular,
  fieldName,
  fieldType,
  isRecordReadOnly = false,
  isCustom = false,
}: isFieldValueReadOnlyParams) => {
  if (isRecordReadOnly) {
    return true;
  }

  if (
    objectNameSingular === CoreObjectNameSingular.WorkflowRun &&
    fieldName === 'output'
  ) {
    return false;
  }

  if (isWorkflowSubObjectMetadata(objectNameSingular)) {
    return true;
  }

  if (objectNameSingular === CoreObjectNameSingular.CalendarEvent) {
    return true;
  }

  if (
    objectNameSingular === CoreObjectNameSingular.Workflow &&
    fieldName !== 'name' &&
    !isCustom
  ) {
    return true;
  }

  if (
    objectNameSingular !== CoreObjectNameSingular.Note &&
    fieldName === 'noteTargets'
  ) {
    return true;
  }

  if (
    objectNameSingular !== CoreObjectNameSingular.Task &&
    fieldName === 'taskTargets'
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
