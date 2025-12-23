import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('getDefaultFormFieldSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct default settings for TEXT field type', () => {
    const result = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    expect(result).toEqual({
      id: 'test-uuid-123',
      name: 'text',
      label: 'Text',
      placeholder: 'Enter your text',
    });
  });

  it('should return correct default settings for NUMBER field type', () => {
    const result = getDefaultFormFieldSettings(FieldMetadataType.NUMBER);
    expect(result).toEqual({
      id: 'test-uuid-123',
      name: 'number',
      label: 'Number',
      placeholder: '1000',
    });
  });

  it('should return correct default settings for DATE field type', () => {
    const result = getDefaultFormFieldSettings(FieldMetadataType.DATE);
    expect(result).toEqual({
      id: 'test-uuid-123',
      name: 'date',
      label: 'Date',
      placeholder: 'mm/dd/yyyy',
    });
  });

  it('should return correct default settings for RECORD field type', () => {
    const result = getDefaultFormFieldSettings('RECORD');
    expect(result).toEqual({
      id: 'test-uuid-123',
      name: 'record',
      label: 'Record',
      placeholder: 'Select a Company',
      settings: {
        objectName: 'company',
      },
    });
  });

  it('should generate unique UUID for each call', () => {
    getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    getDefaultFormFieldSettings(FieldMetadataType.NUMBER);
    expect(v4).toHaveBeenCalledTimes(2);
  });

  it('should return object with required properties for TEXT type', () => {
    const result = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('placeholder');
    expect(result).not.toHaveProperty('settings');
  });

  it('should return object with required properties for RECORD type', () => {
    const result = getDefaultFormFieldSettings('RECORD');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('placeholder');
    expect(result).toHaveProperty('settings');
    expect(result.settings).toHaveProperty('objectName');
  });

  it('should have correct name, label, and placeholder for each field type', () => {
    const textResult = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    expect(textResult.name).toBe('text');
    expect(textResult.label).toBe('Text');
    expect(textResult.placeholder).toBe('Enter your text');

    const numberResult = getDefaultFormFieldSettings(FieldMetadataType.NUMBER);
    expect(numberResult.name).toBe('number');
    expect(numberResult.label).toBe('Number');
    expect(numberResult.placeholder).toBe('1000');

    const dateResult = getDefaultFormFieldSettings(FieldMetadataType.DATE);
    expect(dateResult.name).toBe('date');
    expect(dateResult.label).toBe('Date');
    expect(dateResult.placeholder).toBe('mm/dd/yyyy');

    const recordResult = getDefaultFormFieldSettings('RECORD');
    expect(recordResult.name).toBe('record');
    expect(recordResult.label).toBe('Record');
    expect(recordResult.placeholder).toBe('Select a Company');
  });

  it('should have correct settings object for RECORD type', () => {
    const result = getDefaultFormFieldSettings('RECORD');
    expect(result.settings).toEqual({ objectName: 'company' });
    expect(result.settings?.objectName).toBe('company');
  });

  it('should return consistent results for the same field type', () => {
    const result1 = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    const result2 = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    expect(result1).toEqual(result2);
  });

  it('should return different results for different field types', () => {
    const textResult = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
    const numberResult = getDefaultFormFieldSettings(FieldMetadataType.NUMBER);
    expect(textResult).not.toEqual(numberResult);
    expect(textResult.name).not.toBe(numberResult.name);
    expect(textResult.label).not.toBe(numberResult.label);
    expect(textResult.placeholder).not.toBe(numberResult.placeholder);
  });
});
