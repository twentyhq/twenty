import { MainIdentifierMapper } from '@/object-metadata/types/MainIdentifierMapper';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
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
        name: record.name,
        pictureUrl: getLogoUrlFromDomainName(record.domainName),
        avatarType: 'squared',
      };
    }
    if (relationObjectMetadataItem?.nameSingular === 'workspaceMember') {
      return {
        name: record.name.firstName + ' ' + record.name.lastName,
        pictureUrl: record.avatarUrl,
        avatarType: 'rounded',
      };
    }

    return {
      name: record.name,
      pictureUrl: record.pictureUrl,
      avatarType: 'rounded',
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
    },
    iconName: field.icon ?? 'Icon123',
    isVisible: true,
    relationType: parseFieldRelationType(field),
    mainIdentifierMapper: mainIdentifierMapper,
  };
};
