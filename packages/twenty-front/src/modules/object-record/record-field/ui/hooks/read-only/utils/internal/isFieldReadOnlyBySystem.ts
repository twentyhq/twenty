import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';

import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export type IsFieldReadOnlyBySystemParams = {
  objectNameSingular: string;
  fieldName?: string;
  fieldType?: FieldMetadataType;
  isCustom?: boolean;
  isUIReadOnly?: boolean;
};

export const isFieldReadOnlyBySystem = ({
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
  isUIReadOnly,
}: IsFieldReadOnlyBySystemParams) => {
  if (isUIReadOnly === true) {
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

  if (isDefined(fieldType) && isFieldRichText({ type: fieldType })) {
    return true;
  }

  return false;
};
