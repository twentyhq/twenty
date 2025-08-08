import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';
import { isWorkflowRunJsonField } from '@/object-record/record-field/meta-types/utils/isWorkflowRunJsonField';
import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';

import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type IsFieldReadOnlyBySystemParams = {
  objectNameSingular: string;
  fieldName?: string;
  fieldType?: FieldMetadataType;
  isCustom?: boolean;
};

export const isFieldReadOnlyBySystem = ({
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: IsFieldReadOnlyBySystemParams) => {
  if (
    isWorkflowRunJsonField({
      objectMetadataNameSingular: objectNameSingular,
      fieldName,
    })
  ) {
    return false;
  }

  if (isWorkflowSubObjectMetadata(objectNameSingular) && !isCustom) {
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

  const isFieldDateOrDateTime =
    fieldType === FieldMetadataType.DATE ||
    fieldType === FieldMetadataType.DATE_TIME;
  const isFieldCreatedAtOrUpdatedAt =
    fieldName === 'createdAt' || fieldName === 'updatedAt';

  if (isFieldDateOrDateTime && isFieldCreatedAtOrUpdatedAt) {
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
