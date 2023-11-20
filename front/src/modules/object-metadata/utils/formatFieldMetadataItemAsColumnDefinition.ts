import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { MainIdentifierMapper } from '@/ui/object/field/types/MainIdentifierMapper';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { getLogoUrlFromDomainName } from '~/utils';

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

  const mainIdentifierMapper: MainIdentifierMapper = (record: any) => {
    if (relationObjectMetadataItem?.nameSingular === 'company') {
      return {
        id: record.id,
        name: record.name,
        avatarUrl: getLogoUrlFromDomainName(record.domainName),
        avatarType: 'squared',
        record: record,
      };
    }
    if (relationObjectMetadataItem?.nameSingular === 'workspaceMember') {
      return {
        id: record.id,
        name: record.name.firstName + ' ' + record.name.lastName,
        avatarUrl: record.avatarUrl,
        avatarType: 'rounded',
        record: record,
      };
    }

    return {
      id: record.id,
      name: record.name,
      avatarUrl: record.avatarUrl,
      avatarType: 'rounded',
      record: record,
    };
  };

  return {
    position,
    fieldMetadataId: field.id,
    label: field.label,
    size: 100,
    type: parseFieldType(field.type),
    metadata: {
      fieldName: field.name,
      placeHolder: field.label,
      mainIdentifierMapper: mainIdentifierMapper,
      relationType: parseFieldRelationType(field),
      searchFields: ['name'],
      objectMetadataNamePlural: relationObjectMetadataItem?.namePlural,
      objectMetadataNameSingular: relationObjectMetadataItem?.nameSingular,
    },
    iconName: field.icon ?? 'Icon123',
    isVisible: true,
  };
};
