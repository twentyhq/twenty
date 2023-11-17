import { EntityChipProps } from '@/ui/display/chip/components/EntityChip';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';
import { getLogoUrlFromDomainName } from '~/utils';

export const getEntityChipFromFieldMetadata = (
  fieldDefinition: FieldDefinition<FieldRelationMetadata>,
  fieldValue: any,
) => {
  const { entityChipDisplayMapper } = fieldDefinition;
  const { fieldName } = fieldDefinition.metadata;

  const defaultChipValue: Pick<
    EntityChipProps,
    'name' | 'pictureUrl' | 'avatarType' | 'entityId'
  > = {
    name: '',
    pictureUrl: '',
    avatarType: 'rounded',
    entityId: fieldValue?.id,
  };

  if (['accountOwner', 'person'].includes(fieldName) && fieldValue) {
    return {
      ...defaultChipValue,
      name: `${fieldValue.firstName} ${fieldValue.lastName}`,
    };
  }

  if (fieldName === 'company' && fieldValue) {
    return {
      ...defaultChipValue,
      name: fieldValue.name,
      pictureUrl: getLogoUrlFromDomainName(fieldValue.domainName),
    };
  }

  return {
    ...defaultChipValue,
    ...entityChipDisplayMapper?.(fieldValue),
  };
};
