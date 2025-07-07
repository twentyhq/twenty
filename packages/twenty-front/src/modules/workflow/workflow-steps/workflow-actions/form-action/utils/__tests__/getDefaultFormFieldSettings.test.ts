import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import { WorkflowFormFieldType } from '../../types/WorkflowFormFieldType';
import { getDefaultFormFieldSettings } from '../getDefaultFormFieldSettings';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('getDefaultFormFieldSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FieldMetadataType.TEXT', () => {
    it('should return correct default settings for TEXT field type', () => {
      const result = getDefaultFormFieldSettings(FieldMetadataType.TEXT);

      expect(result).toEqual({
        id: 'test-uuid-123',
        name: 'text',
        label: 'Text',
        placeholder: 'Enter your text',
      });
    });
  });

  describe('FieldMetadataType.NUMBER', () => {
    it('should return correct default settings for NUMBER field type', () => {
      const result = getDefaultFormFieldSettings(FieldMetadataType.NUMBER);

      expect(result).toEqual({
        id: 'test-uuid-123',
        name: 'number',
        label: 'Number',
        placeholder: '1000',
      });
    });
  });

  describe('FieldMetadataType.DATE', () => {
    it('should return correct default settings for DATE field type', () => {
      const result = getDefaultFormFieldSettings(FieldMetadataType.DATE);

      expect(result).toEqual({
        id: 'test-uuid-123',
        name: 'date',
        label: 'Date',
        placeholder: 'mm/dd/yyyy',
      });
    });
  });

  describe('RECORD type', () => {
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
  });

  describe('UUID generation', () => {
    it('should generate unique UUID for each call', () => {
      getDefaultFormFieldSettings(FieldMetadataType.TEXT);
      getDefaultFormFieldSettings(FieldMetadataType.NUMBER);

      expect(v4).toHaveBeenCalledTimes(2);
    });
  });

  describe('return value structure', () => {
    it('should return object with required properties for TEXT type', () => {
      const result = getDefaultFormFieldSettings(FieldMetadataType.TEXT);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('placeholder');
      expect(result).not.toHaveProperty('settings');
    });

    it('should return object with required properties for NUMBER type', () => {
      const result = getDefaultFormFieldSettings(FieldMetadataType.NUMBER);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('placeholder');
      expect(result).not.toHaveProperty('settings');
    });

    it('should return object with required properties for DATE type', () => {
      const result = getDefaultFormFieldSettings(FieldMetadataType.DATE);

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
  });

  describe('field type specific values', () => {
    it('should have correct name values for each field type', () => {
      const textResult = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
      const numberResult = getDefaultFormFieldSettings(
        FieldMetadataType.NUMBER,
      );
      const dateResult = getDefaultFormFieldSettings(FieldMetadataType.DATE);
      const recordResult = getDefaultFormFieldSettings('RECORD');

      expect(textResult.name).toBe('text');
      expect(numberResult.name).toBe('number');
      expect(dateResult.name).toBe('date');
      expect(recordResult.name).toBe('record');
    });

    it('should have correct label values for each field type', () => {
      const textResult = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
      const numberResult = getDefaultFormFieldSettings(
        FieldMetadataType.NUMBER,
      );
      const dateResult = getDefaultFormFieldSettings(FieldMetadataType.DATE);
      const recordResult = getDefaultFormFieldSettings('RECORD');

      expect(textResult.label).toBe('Text');
      expect(numberResult.label).toBe('Number');
      expect(dateResult.label).toBe('Date');
      expect(recordResult.label).toBe('Record');
    });

    it('should have correct placeholder values for each field type', () => {
      const textResult = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
      const numberResult = getDefaultFormFieldSettings(
        FieldMetadataType.NUMBER,
      );
      const dateResult = getDefaultFormFieldSettings(FieldMetadataType.DATE);
      const recordResult = getDefaultFormFieldSettings('RECORD');

      expect(textResult.placeholder).toBe('Enter your text');
      expect(numberResult.placeholder).toBe('1000');
      expect(dateResult.placeholder).toBe('mm/dd/yyyy');
      expect(recordResult.placeholder).toBe('Select a Company');
    });
  });

  describe('RECORD type specific settings', () => {
    it('should have correct settings object for RECORD type', () => {
      const result = getDefaultFormFieldSettings('RECORD');

      expect(result.settings).toEqual({
        objectName: 'company',
      });
    });

    it('should have objectName set to company for RECORD type', () => {
      const result = getDefaultFormFieldSettings('RECORD');

      expect(result.settings?.objectName).toBe('company');
    });
  });

  describe('consistency', () => {
    it('should return consistent results for the same field type', () => {
      const result1 = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
      const result2 = getDefaultFormFieldSettings(FieldMetadataType.TEXT);

      expect(result1).toEqual(result2);
    });

    it('should return different results for different field types', () => {
      const textResult = getDefaultFormFieldSettings(FieldMetadataType.TEXT);
      const numberResult = getDefaultFormFieldSettings(
        FieldMetadataType.NUMBER,
      );

      expect(textResult).not.toEqual(numberResult);
      expect(textResult.name).not.toBe(numberResult.name);
      expect(textResult.label).not.toBe(numberResult.label);
      expect(textResult.placeholder).not.toBe(numberResult.placeholder);
    });
  });

  describe('type safety', () => {
    it('should accept all valid WorkflowFormFieldType values', () => {
      const validTypes: WorkflowFormFieldType[] = [
        FieldMetadataType.TEXT,
        FieldMetadataType.NUMBER,
        FieldMetadataType.DATE,
        'RECORD',
      ];

      validTypes.forEach((type) => {
        expect(() => getDefaultFormFieldSettings(type)).not.toThrow();
      });
    });
  });
});
