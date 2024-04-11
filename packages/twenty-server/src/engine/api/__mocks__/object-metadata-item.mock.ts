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
  defaultValue: { amountMicros: null, currencyCode: "''" },
};

export const fieldSelectMock = {
  name: 'fieldSelect',
  type: FieldMetadataType.SELECT,
  isNullable: true,
  defaultValue: 'OPTION_1',
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      color: 'red',
      label: 'Opt 1',
      value: 'OPTION_1',
      position: 0,
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      color: 'purple',
      label: 'Opt 2',
      value: 'OPTION_2',
      position: 1,
    },
  ],
};

export const objectMetadataItemMock = {
  targetTableName: 'testingObject',
  nameSingular: 'objectName',
  namePlural: 'objectsName',
  fields: [
    fieldNumberMock,
    fieldStringMock,
    fieldLinkMock,
    fieldCurrencyMock,
    fieldSelectMock,
  ],
} as ObjectMetadataEntity;
