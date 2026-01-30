import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  WidgetConfigurationType,
  type AggregateChartConfiguration,
} from '~/generated/graphql';

import { areChartConfigurationFieldsValidForQuery } from '@/page-layout/widgets/graph/utils/areChartConfigurationFieldsValidForQuery';

describe('areChartConfigurationFieldsValidForQuery', () => {
  const createMockObjectMetadataItem = (
    fields: Array<{
      id: string;
      type: FieldMetadataType;
      options?: Array<{ value: string; label: string }>;
    }>,
  ): ObjectMetadataItem =>
    ({
      id: 'object-1',
      nameSingular: 'opportunity',
      namePlural: 'opportunities',
      fields: fields.map((f) => ({
        id: f.id,
        name: f.id,
        type: f.type,
        label: f.id,
        options: f.options,
      })),
    }) as ObjectMetadataItem;

  const createAggregateConfig = (ratioAggregateConfig?: {
    fieldMetadataId: string;
    optionValue: string;
  }): AggregateChartConfiguration => ({
    __typename: 'AggregateChartConfiguration',
    configurationType: WidgetConfigurationType.AGGREGATE_CHART,
    aggregateFieldMetadataId: 'aggregate-field',
    aggregateOperation: AggregateOperations.COUNT,
    ratioAggregateConfig: ratioAggregateConfig ?? null,
  });

  describe('AggregateChartConfiguration with ratioAggregateConfig', () => {
    it('should return true when ratioAggregateConfig is undefined', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig(undefined),
        objectMetadataItem,
      );

      expect(result).toBe(true);
    });

    it('should return false when ratio field does not exist', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'non-existent-field',
          optionValue: 'true',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(false);
    });

    it('should return true for BOOLEAN field with "true" optionValue', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        { id: 'boolean-field', type: FieldMetadataType.BOOLEAN },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'boolean-field',
          optionValue: 'true',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(true);
    });

    it('should return true for BOOLEAN field with "false" optionValue', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        { id: 'boolean-field', type: FieldMetadataType.BOOLEAN },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'boolean-field',
          optionValue: 'false',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(true);
    });

    it('should return false for BOOLEAN field with invalid optionValue', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        { id: 'boolean-field', type: FieldMetadataType.BOOLEAN },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'boolean-field',
          optionValue: 'invalid',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(false);
    });

    it('should return true for SELECT field with valid option', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        {
          id: 'select-field',
          type: FieldMetadataType.SELECT,
          options: [
            { value: 'WON', label: 'Won' },
            { value: 'LOST', label: 'Lost' },
          ],
        },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'select-field',
          optionValue: 'WON',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(true);
    });

    it('should return false for SELECT field with invalid option', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        {
          id: 'select-field',
          type: FieldMetadataType.SELECT,
          options: [
            { value: 'WON', label: 'Won' },
            { value: 'LOST', label: 'Lost' },
          ],
        },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'select-field',
          optionValue: 'INVALID_OPTION',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(false);
    });

    it('should return true for MULTI_SELECT field with valid option', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        {
          id: 'multiselect-field',
          type: FieldMetadataType.MULTI_SELECT,
          options: [
            { value: 'urgent', label: 'Urgent' },
            { value: 'important', label: 'Important' },
          ],
        },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'multiselect-field',
          optionValue: 'urgent',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(true);
    });

    it('should return false for unsupported field type with ratioConfig', () => {
      const objectMetadataItem = createMockObjectMetadataItem([
        { id: 'aggregate-field', type: FieldMetadataType.NUMBER },
        { id: 'text-field', type: FieldMetadataType.TEXT },
      ]);

      const result = areChartConfigurationFieldsValidForQuery(
        createAggregateConfig({
          fieldMetadataId: 'text-field',
          optionValue: 'some-value',
        }),
        objectMetadataItem,
      );

      expect(result).toBe(false);
    });
  });
});
