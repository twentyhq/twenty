import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { AvatarType } from '@/users/components/Avatar';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

import { parseFieldType } from './parseFieldType';

export const formatFieldMetadataItemAsColumnDefinition = ({
  position,
  field,
}: {
  position: number;
  field: FieldMetadataItem;
}): ColumnDefinition<FieldMetadata> => {
  const relationObjectMetadataItem =
    field.toRelationMetadata?.fromObjectMetadata;

  const labelIdentifierFieldPaths = ['person', 'workspaceMember'].includes(
    relationObjectMetadataItem?.nameSingular ?? '',
  )
    ? ['name.firstName', 'name.lastName']
    : ['name'];
  const imageIdentifierFormat: AvatarType = ['company'].includes(
    relationObjectMetadataItem?.nameSingular ?? '',
  )
    ? 'squared'
    : 'rounded';
  const imageIdentifierUrlPrefix = ['company'].includes(
    relationObjectMetadataItem?.nameSingular ?? '',
  )
    ? 'https://favicon.twenty.com/'
    : '';
  const imageIdentifierUrlField = ['company'].includes(
    relationObjectMetadataItem?.nameSingular ?? '',
  )
    ? 'domainName'
    : 'avatarUrl';

  return {
    position,
    fieldMetadataId: field.id,
    label: field.label,
    size: 100,
    type: parseFieldType(field.type),
    metadata: {
      fieldName: field.name,
      placeHolder: field.label,
      labelIdentifierFieldPaths,
      imageIdentifierUrlField,
      imageIdentifierUrlPrefix,
      imageIdentifierFormat,
      relationType: parseFieldRelationType(field),
      searchFields: ['name'],
      objectMetadataNamePlural: relationObjectMetadataItem?.namePlural ?? '',
      objectMetadataNameSingular:
        relationObjectMetadataItem?.nameSingular ?? '',
    },
    iconName: field.icon ?? 'Icon123',
    isVisible: true,
  };
};
