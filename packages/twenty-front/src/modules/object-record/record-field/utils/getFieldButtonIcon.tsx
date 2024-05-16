import { IconComponent, IconPencil } from 'twenty-ui';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldDisplayedAsPhone } from '@/object-record/record-field/types/guards/isFieldDisplayedAsPhone';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldPhone } from '../types/guards/isFieldPhone';

export const getFieldButtonIcon = (
  fieldDefinition:
    | Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>
    | undefined
    | null,
): IconComponent | undefined => {
  if (isUndefinedOrNull(fieldDefinition)) return undefined;

  if (
    isFieldLink(fieldDefinition) ||
    isFieldEmail(fieldDefinition) ||
    isFieldPhone(fieldDefinition) ||
    isFieldDisplayedAsPhone(fieldDefinition) ||
    isFieldMultiSelect(fieldDefinition) ||
    (isFieldRelation(fieldDefinition) &&
      fieldDefinition.metadata.relationObjectMetadataNameSingular !==
        'workspaceMember') ||
    isFieldLinks(fieldDefinition)
  ) {
    return IconPencil;
  }
};
