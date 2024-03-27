import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fieldNumberMock = {
  name: 'fieldNumber',
  type: FieldMetadataType.NUMBER,
  isNullable: false,
  defaultValue: null,
};

export const fieldStringMock = {
  name: 'fieldString',
  type: FieldMetadataType.TEXT,
  isNullable: true,
  defaultValue: null,
};

export const fieldLinkMock = {
  name: 'fieldLink',
  type: FieldMetadataType.LINK,
  isNullable: false,
  defaultValue: { label: '', url: '' },
};

export const fieldCurrencyMock = {
  name: 'fieldCurrency',
  type: FieldMetadataType.CURRENCY,
  isNullable: true,
  defaultValue: null,
};

export const objectMetadataItemMock: DeepPartial<ObjectMetadataEntity> = {
  targetTableName: 'testingObject',
  nameSingular: 'objectName',
  namePlural: 'objectsName',
  fields: [fieldNumberMock, fieldStringMock, fieldLinkMock, fieldCurrencyMock],
};
