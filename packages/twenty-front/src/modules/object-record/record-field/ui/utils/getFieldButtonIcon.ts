import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldDisplayedAsPhone } from '@/object-record/record-field/ui/types/guards/isFieldDisplayedAsPhone';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldFiles } from '@/object-record/record-field/ui/types/guards/isFieldFiles';
import { IconPencil, type IconComponent } from 'twenty-ui/icon';
import { isDefined } from 'twenty-shared/utils';

export const getFieldButtonIcon = (
  fieldDefinition:
    | Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>
    | undefined
    | null,
): IconComponent | undefined => {
  if (!isDefined(fieldDefinition)) return undefined;

  if (
    isFieldDisplayedAsPhone(fieldDefinition) ||
    isFieldMultiSelect(fieldDefinition) ||
    (isFieldRelation(fieldDefinition) &&
      fieldDefinition.metadata.relationObjectMetadataNameSingular !==
        'workspaceMember') ||
    isFieldLinks(fieldDefinition) ||
    isFieldEmails(fieldDefinition) ||
    isFieldArray(fieldDefinition) ||
    isFieldFiles(fieldDefinition) ||
    isFieldPhones(fieldDefinition)
  ) {
    return IconPencil;
  }
};
