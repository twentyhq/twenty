import { useContext } from 'react';
import { IconComponent, IconPencil } from 'twenty-ui';

import { isFieldDisplayedAsPhone } from '@/object-record/record-field/types/guards/isFieldDisplayedAsPhone';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldPhone } from '../types/guards/isFieldPhone';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

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
