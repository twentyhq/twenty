import {
  FieldMetadataType,
  type FormulaAggregateFunctionName,
} from 'twenty-shared/types';

import { getFormulaAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregatableFieldMetadataItems';

const buildField = ({
  name,
  type,
  isActive = true,
  isSystem = false,
  settings = null,
}: {
  name: string;
  type: FieldMetadataType;
  isActive?: boolean;
  isSystem?: boolean;
  settings?: { formula: { expression: string } } | null;
}) => ({ name, type, isActive, isSystem, settings });

const FIELDS = [
  buildField({ name: 'probability', type: FieldMetadataType.NUMBER }),
  buildField({ name: 'amount', type: FieldMetadataType.CURRENCY }),
  buildField({ name: 'closeDate', type: FieldMetadataType.DATE_TIME }),
  buildField({ name: 'signedOn', type: FieldMetadataType.DATE }),
  buildField({ name: 'name', type: FieldMetadataType.TEXT }),
  buildField({
    name: 'position',
    type: FieldMetadataType.NUMBER,
    isSystem: true,
  }),
  buildField({
    name: 'legacy',
    type: FieldMetadataType.NUMBER,
    isActive: false,
  }),
  buildField({
    name: 'nameLength',
    type: FieldMetadataType.NUMBER,
    settings: { formula: { expression: 'length(name)' } },
  }),
];

const getNames = ({
  functionName,
  fieldType,
}: {
  functionName: FormulaAggregateFunctionName;
  fieldType: FieldMetadataType;
}) =>
  getFormulaAggregatableFieldMetadataItems({
    fieldMetadataItems: FIELDS,
    functionName,
    fieldType,
  }).map(({ name }) => name);

describe('getFormulaAggregatableFieldMetadataItems', () => {
  it('should offer active number and currency fields for a sum into a number', () => {
    expect(
      getNames({ functionName: 'sum', fieldType: FieldMetadataType.NUMBER }),
    ).toEqual(['probability', 'amount']);
  });

  it('should offer number and currency fields for a max into a number', () => {
    expect(
      getNames({ functionName: 'max', fieldType: FieldMetadataType.NUMBER }),
    ).toEqual(['probability', 'amount']);
  });

  it('should offer date fields for a min into a date', () => {
    expect(
      getNames({ functionName: 'min', fieldType: FieldMetadataType.DATE }),
    ).toEqual(['closeDate', 'signedOn']);
  });

  it('should offer nothing for an average into a date, nor for a count', () => {
    expect(
      getNames({ functionName: 'avg', fieldType: FieldMetadataType.DATE_TIME }),
    ).toEqual([]);
    expect(
      getNames({ functionName: 'count', fieldType: FieldMetadataType.NUMBER }),
    ).toEqual([]);
  });
});
