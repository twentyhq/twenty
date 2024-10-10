import { IconComponent, IconPencil } from 'twenty-ui';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldDisplayedAsPhone } from '@/object-record/record-field/types/guards/isFieldDisplayedAsPhone';
import { isFieldEmails } from '@/object-record/record-field/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isFieldArray } from '@/object-record/record-field/types/guards/isFieldArray';

export const getFieldButtonIcon = (
  fieldDefinition:
    | Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>
    | undefined
    | null,
): IconComponent | undefined => {
  if (isUndefinedOrNull(fieldDefinition)) return undefined;

  if (
    isFieldDisplayedAsPhone(fieldDefinition) ||
    isFieldMultiSelect(fieldDefinition) ||
    (isFieldRelation(fieldDefinition) &&
      fieldDefinition.metadata.relationObjectMetadataNameSingular !==
        'workspaceMember') ||
    isFieldLinks(fieldDefinition) ||
    isFieldEmails(fieldDefinition) ||
    isFieldArray(fieldDefinition) ||
    isFieldPhones(fieldDefinition)
  ) {
    return IconPencil;
  }
};
