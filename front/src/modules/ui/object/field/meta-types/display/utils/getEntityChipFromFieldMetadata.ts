import { EntityChipProps } from '@/ui/display/chip/components/EntityChip';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';
import { getLogoUrlFromDomainName } from '~/utils';

export const getEntityChipFromFieldMetadata = (
  fieldDefinition: FieldDefinition<FieldRelationMetadata>,
  fieldValue: any,
) => {
  const { fieldName } = fieldDefinition.metadata;

  const chipValue: Pick<
    EntityChipProps,
    'name' | 'pictureUrl' | 'avatarType' | 'entityId'
  > = {
    name: '',
    pictureUrl: '',
    avatarType: 'rounded',
    entityId: fieldValue?.id,
  };

  // TODO: use every
  if (fieldName === 'accountOwner' && fieldValue) {
    chipValue.name = fieldValue.name.firstName + ' ' + fieldValue.name.lastName;
  } else if (fieldName === 'company' && fieldValue) {
    chipValue.name = fieldValue.name;
    chipValue.pictureUrl = getLogoUrlFromDomainName(fieldValue.domainName);
  } else if (fieldName === 'person' && fieldValue) {
    chipValue.name = fieldValue.name.firstName + ' ' + fieldValue.name.lastName;
  }

  return chipValue;
};
