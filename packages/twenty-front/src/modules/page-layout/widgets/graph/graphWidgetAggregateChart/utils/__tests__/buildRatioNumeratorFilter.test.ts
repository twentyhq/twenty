import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type RatioAggregateConfig } from '~/generated/graphql';

import { buildRatioNumeratorFilter } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/buildRatioNumeratorFilter';

describe('buildRatioNumeratorFilter', () => {
  const mockBooleanField = {
    id: 'field-1',
    name: 'isActive',
    type: FieldMetadataType.BOOLEAN,
  } as FieldMetadataItem;

  const mockSelectField = {
    id: 'field-2',
    name: 'stage',
    type: FieldMetadataType.SELECT,
  } as FieldMetadataItem;

  const mockMultiSelectField = {
    id: 'field-3',
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
  } as FieldMetadataItem;

  const baseFilter = { createdAt: { gte: '2024-01-01' } };

  it('should return baseFilter when ratioConfig is undefined', () => {
    const result = buildRatioNumeratorFilter({
      ratioConfig: undefined,
      ratioField: mockBooleanField,
      baseFilter,
    });

    expect(result).toEqual(baseFilter);
  });

  it('should return baseFilter when ratioField is undefined', () => {
    const ratioConfig: RatioAggregateConfig = {
      fieldMetadataId: 'field-1',
      optionValue: 'true',
    };

    const result = buildRatioNumeratorFilter({
      ratioConfig,
      ratioField: undefined,
      baseFilter,
    });

    expect(result).toEqual(baseFilter);
  });

  it('should build correct filter for BOOLEAN field with "true"', () => {
    const ratioConfig: RatioAggregateConfig = {
      fieldMetadataId: 'field-1',
      optionValue: 'true',
    };

    const result = buildRatioNumeratorFilter({
      ratioConfig,
      ratioField: mockBooleanField,
      baseFilter: undefined,
    });

    expect(result).toEqual({
      isActive: { eq: true },
    });
  });

  it('should build correct filter for BOOLEAN field with "false"', () => {
    const ratioConfig: RatioAggregateConfig = {
      fieldMetadataId: 'field-1',
      optionValue: 'false',
    };

    const result = buildRatioNumeratorFilter({
      ratioConfig,
      ratioField: mockBooleanField,
      baseFilter: undefined,
    });

    expect(result).toEqual({
      isActive: { eq: false },
    });
  });

  it('should build correct filter for SELECT field', () => {
    const ratioConfig: RatioAggregateConfig = {
      fieldMetadataId: 'field-2',
      optionValue: 'WON',
    };

    const result = buildRatioNumeratorFilter({
      ratioConfig,
      ratioField: mockSelectField,
      baseFilter: undefined,
    });

    expect(result).toEqual({
      stage: { eq: 'WON' },
    });
  });

  it('should build correct filter for MULTI_SELECT field using containsAny', () => {
    const ratioConfig: RatioAggregateConfig = {
      fieldMetadataId: 'field-3',
      optionValue: 'urgent',
    };

    const result = buildRatioNumeratorFilter({
      ratioConfig,
      ratioField: mockMultiSelectField,
      baseFilter: undefined,
    });

    expect(result).toEqual({
      tags: { containsAny: ['urgent'] },
    });
  });

  it('should combine with baseFilter using AND when both exist', () => {
    const ratioConfig: RatioAggregateConfig = {
      fieldMetadataId: 'field-2',
      optionValue: 'WON',
    };

    const result = buildRatioNumeratorFilter({
      ratioConfig,
      ratioField: mockSelectField,
      baseFilter,
    });

    expect(result).toEqual({
      and: [baseFilter, { stage: { eq: 'WON' } }],
    });
  });
});
