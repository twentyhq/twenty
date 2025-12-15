import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  computeStepOutputSchema,
  shouldComputeOutputSchemaOnFrontend,
} from '@/workflow/workflow-variables/utils/generate/computeStepOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';

const mockCompanyObjectMetadataItem: ObjectMetadataItem = {
  id: 'company-metadata-id',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  icon: 'IconBuildingSkyscraper',
  fields: [
    {
      id: 'name-field-id',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
      isActive: true,
      isSystem: false,
    },
  ],
} as ObjectMetadataItem;

describe('computeStepOutputSchema', () => {
  describe('PERSISTED_OUTPUT_SCHEMA_TYPES', () => {
    it('should return undefined for CODE step type', () => {
      const result = computeStepOutputSchema({
        step: { type: 'CODE', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined for HTTP_REQUEST step type', () => {
      const result = computeStepOutputSchema({
        step: { type: 'HTTP_REQUEST', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined for AI_AGENT step type', () => {
      const result = computeStepOutputSchema({
        step: { type: 'AI_AGENT', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined for WEBHOOK step type', () => {
      const result = computeStepOutputSchema({
        step: { type: 'WEBHOOK', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined for ITERATOR step type', () => {
      const result = computeStepOutputSchema({
        step: { type: 'ITERATOR', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toBeUndefined();
    });
  });

  describe('DATABASE_EVENT trigger', () => {
    it('should return empty object when eventName is not defined', () => {
      const result = computeStepOutputSchema({
        step: { type: 'DATABASE_EVENT', settings: {} } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return empty object when eventName cannot be parsed', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'DATABASE_EVENT',
          settings: { eventName: 'invalid' },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return empty object when object metadata is not found', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'DATABASE_EVENT',
          settings: { eventName: 'unknownObject.created' },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return record event output schema for valid eventName', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'DATABASE_EVENT',
          settings: { eventName: 'company.created' },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toHaveProperty('_outputSchemaType', 'RECORD');
      expect(result).toHaveProperty('object');
      expect(result).toHaveProperty('fields');
    });

    it('should return empty object for invalid action string', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'DATABASE_EVENT',
          settings: { eventName: 'company.invalidAction' },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it.each(['updated', 'deleted', 'upserted'])(
      'should return record event output schema for %s action',
      (action) => {
        const result = computeStepOutputSchema({
          step: {
            type: 'DATABASE_EVENT',
            settings: { eventName: `company.${action}` },
          } as any,
          objectMetadataItems: [mockCompanyObjectMetadataItem],
        });

        expect(result).toHaveProperty('_outputSchemaType', 'RECORD');
        expect(result).toHaveProperty('object');
      },
    );
  });

  describe('MANUAL trigger', () => {
    it('should return empty object when availability is not defined', () => {
      const result = computeStepOutputSchema({
        step: { type: 'MANUAL', settings: {} } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return empty object for GLOBAL availability', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'MANUAL',
          settings: { availability: { type: 'GLOBAL' } },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return record output schema for SINGLE_RECORD availability', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'MANUAL',
          settings: {
            availability: {
              type: 'SINGLE_RECORD',
              objectNameSingular: 'company',
            },
          },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toHaveProperty('_outputSchemaType', 'RECORD');
      expect(result).toHaveProperty('object');
    });

    it('should return array indicator for BULK_RECORDS availability', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'MANUAL',
          settings: {
            availability: {
              type: 'BULK_RECORDS',
              objectNameSingular: 'company',
            },
          },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toHaveProperty('companies');
      expect((result as any).companies).toMatchObject({
        isLeaf: true,
        label: 'Companies',
        type: 'array',
      });
    });

    it('should return empty object when object metadata is not found for SINGLE_RECORD', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'MANUAL',
          settings: {
            availability: {
              type: 'SINGLE_RECORD',
              objectNameSingular: 'unknownObject',
            },
          },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return empty object when object metadata is not found for BULK_RECORDS', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'MANUAL',
          settings: {
            availability: {
              type: 'BULK_RECORDS',
              objectNameSingular: 'unknownObject',
            },
          },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });
  });

  describe('CRON trigger', () => {
    it('should return empty object', () => {
      const result = computeStepOutputSchema({
        step: { type: 'CRON', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toEqual({});
    });
  });

  describe('Record action steps', () => {
    it.each([
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'UPSERT_RECORD',
    ])(
      'should return empty object for %s when objectName is not defined',
      (stepType) => {
        const result = computeStepOutputSchema({
          step: { type: stepType, settings: { input: {} } } as any,
          objectMetadataItems: [mockCompanyObjectMetadataItem],
        });

        expect(result).toEqual({});
      },
    );

    it.each([
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'UPSERT_RECORD',
    ])(
      'should return empty object for %s when object metadata is not found',
      (stepType) => {
        const result = computeStepOutputSchema({
          step: {
            type: stepType,
            settings: { input: { objectName: 'unknownObject' } },
          } as any,
          objectMetadataItems: [mockCompanyObjectMetadataItem],
        });

        expect(result).toEqual({});
      },
    );

    it.each([
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'UPSERT_RECORD',
    ])(
      'should return record output schema for %s with valid objectName',
      (stepType) => {
        const result = computeStepOutputSchema({
          step: {
            type: stepType,
            settings: { input: { objectName: 'company' } },
          } as any,
          objectMetadataItems: [mockCompanyObjectMetadataItem],
        });

        expect(result).toHaveProperty('_outputSchemaType', 'RECORD');
        expect(result).toHaveProperty('object');
      },
    );
  });

  describe('FIND_RECORDS step', () => {
    it('should return empty object when objectName is not defined', () => {
      const result = computeStepOutputSchema({
        step: { type: 'FIND_RECORDS', settings: { input: {} } } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return empty object when object metadata is not found', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'FIND_RECORDS',
          settings: { input: { objectName: 'unknownObject' } },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toEqual({});
    });

    it('should return find records output schema with valid objectName', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'FIND_RECORDS',
          settings: { input: { objectName: 'company' } },
        } as any,
        objectMetadataItems: [mockCompanyObjectMetadataItem],
      });

      expect(result).toHaveProperty('first');
      expect(result).toHaveProperty('all');
      expect(result).toHaveProperty('totalCount');
    });
  });

  describe('FORM step', () => {
    it('should return empty object when form fields are not defined', () => {
      const result = computeStepOutputSchema({
        step: { type: 'FORM', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toEqual({});
    });

    it('should return empty object when form fields are empty', () => {
      const result = computeStepOutputSchema({
        step: { type: 'FORM', settings: { input: [] } } as any,
        objectMetadataItems: [],
      });

      expect(result).toEqual({});
    });

    it('should return form output schema with valid form fields', () => {
      const result = computeStepOutputSchema({
        step: {
          type: 'FORM',
          settings: {
            input: [
              {
                id: 'field-1',
                name: 'firstName',
                label: 'First Name',
                type: 'TEXT',
              },
            ],
          },
        } as any,
        objectMetadataItems: [],
      });

      expect(result).toHaveProperty('firstName');
      expect((result as any).firstName).toMatchObject({
        isLeaf: true,
        label: 'First Name',
      });
    });
  });

  describe('SEND_EMAIL step', () => {
    it('should return success boolean schema', () => {
      const result = computeStepOutputSchema({
        step: { type: 'SEND_EMAIL', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toEqual({
        success: {
          isLeaf: true,
          type: FieldMetadataType.BOOLEAN,
          label: 'Success',
          value: true,
        },
      });
    });
  });

  describe('Empty output schema steps', () => {
    it.each(['FILTER', 'DELAY', 'EMPTY'])(
      'should return empty object for %s step type',
      (stepType) => {
        const result = computeStepOutputSchema({
          step: { type: stepType, settings: {} } as any,
          objectMetadataItems: [],
        });

        expect(result).toEqual({});
      },
    );
  });

  describe('Unknown step type', () => {
    it('should return empty object for unknown step type', () => {
      const result = computeStepOutputSchema({
        step: { type: 'UNKNOWN_TYPE', settings: {} } as any,
        objectMetadataItems: [],
      });

      expect(result).toEqual({});
    });
  });
});

describe('shouldComputeOutputSchemaOnFrontend', () => {
  it('should return false for CODE', () => {
    expect(shouldComputeOutputSchemaOnFrontend('CODE')).toBe(false);
  });

  it('should return false for HTTP_REQUEST', () => {
    expect(shouldComputeOutputSchemaOnFrontend('HTTP_REQUEST')).toBe(false);
  });

  it('should return false for AI_AGENT', () => {
    expect(shouldComputeOutputSchemaOnFrontend('AI_AGENT')).toBe(false);
  });

  it('should return false for WEBHOOK', () => {
    expect(shouldComputeOutputSchemaOnFrontend('WEBHOOK')).toBe(false);
  });

  it('should return false for ITERATOR', () => {
    expect(shouldComputeOutputSchemaOnFrontend('ITERATOR')).toBe(false);
  });

  it('should return true for DATABASE_EVENT', () => {
    expect(shouldComputeOutputSchemaOnFrontend('DATABASE_EVENT')).toBe(true);
  });

  it('should return true for CREATE_RECORD', () => {
    expect(shouldComputeOutputSchemaOnFrontend('CREATE_RECORD')).toBe(true);
  });

  it('should return true for FIND_RECORDS', () => {
    expect(shouldComputeOutputSchemaOnFrontend('FIND_RECORDS')).toBe(true);
  });

  it('should return true for SEND_EMAIL', () => {
    expect(shouldComputeOutputSchemaOnFrontend('SEND_EMAIL')).toBe(true);
  });
});
