import { isNonEmptyString, isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  arrayOfStringsOrVariablesSchema,
  isDefined,
  isPlainObject,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';
import { recordFilterSchema } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';

type StoredRecordFilter = Record<string, unknown>;

type MappedValue = { value: unknown; hasChanged: boolean };

const parseJson = (value: string): { parsed: unknown } | undefined => {
  try {
    return { parsed: JSON.parse(value) };
  } catch {
    return undefined;
  }
};

export const wrapBareSelectFilterValue = (value: string): string => {
  if (
    value === '' ||
    arrayOfStringsOrVariablesSchema.safeParse(value).success
  ) {
    return value;
  }

  const json = parseJson(value);

  if (!isDefined(json)) {
    return JSON.stringify([value]);
  }

  if (isString(json.parsed)) {
    return JSON.stringify([json.parsed]);
  }

  if (typeof json.parsed === 'number' || typeof json.parsed === 'boolean') {
    return JSON.stringify([value]);
  }

  return value;
};

const isSelectRecordFilter = ({
  recordFilter,
  flatFieldMetadataMaps,
}: {
  recordFilter: StoredRecordFilter;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  const { fieldMetadataId, relationTargetFieldMetadataId } = recordFilter;

  const parsedOperand = recordFilterSchema.shape.operand.safeParse(
    recordFilter.operand,
  );

  if (
    !isString(fieldMetadataId) ||
    !parsedOperand.success ||
    isNonEmptyString(recordFilter.subFieldName) ||
    !isRecordFilterOperandExpectingValue(parsedOperand.data)
  ) {
    return false;
  }

  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(flatFieldMetadata)) {
    return false;
  }

  const relationTargetFlatFieldMetadata = isString(
    relationTargetFieldMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationTargetFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  const effectiveFieldType = getEffectiveFilterFieldType({
    fieldType: flatFieldMetadata.type,
    relationTargetFieldType: relationTargetFlatFieldMetadata?.type,
  });

  return (
    effectiveFieldType === FieldMetadataType.SELECT ||
    effectiveFieldType === FieldMetadataType.MULTI_SELECT
  );
};

export const wrapBareSelectRecordFilterValue = ({
  recordFilter,
  flatFieldMetadataMaps,
}: {
  recordFilter: StoredRecordFilter;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): StoredRecordFilter => {
  const { value } = recordFilter;

  if (
    !isString(value) ||
    !isSelectRecordFilter({ recordFilter, flatFieldMetadataMaps })
  ) {
    return recordFilter;
  }

  const wrappedValue = wrapBareSelectFilterValue(value);

  return wrappedValue === value
    ? recordFilter
    : { ...recordFilter, value: wrappedValue };
};

const wrapRecordFiltersOfFilter = ({
  filter,
  flatFieldMetadataMaps,
}: {
  filter: unknown;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): unknown => {
  if (!isPlainObject(filter) || !Array.isArray(filter.recordFilters)) {
    return filter;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters.map((recordFilter) =>
      isPlainObject(recordFilter)
        ? wrapBareSelectRecordFilterValue({
            recordFilter,
            flatFieldMetadataMaps,
          })
        : recordFilter,
    ),
  };
};

const toMappedValue = ({
  original,
  mapped,
}: {
  original: unknown;
  mapped: unknown;
}): MappedValue =>
  JSON.stringify(original) === JSON.stringify(mapped)
    ? { value: original, hasChanged: false }
    : { value: mapped, hasChanged: true };

export const wrapBareSelectValuesOfFindRecordsSteps = ({
  steps,
  flatFieldMetadataMaps,
}: {
  steps: unknown;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): MappedValue => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  const mappedSteps = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      step.type !== 'FIND_RECORDS' ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input)
    ) {
      return step;
    }

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          filter: wrapRecordFiltersOfFilter({
            filter: step.settings.input.filter,
            flatFieldMetadataMaps,
          }),
        },
      },
    };
  });

  return toMappedValue({ original: steps, mapped: mappedSteps });
};

export const wrapBareSelectValuesOfChartConfiguration = ({
  configuration,
  flatFieldMetadataMaps,
}: {
  configuration: unknown;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): MappedValue => {
  if (!isPlainObject(configuration) || !('filter' in configuration)) {
    return { value: configuration, hasChanged: false };
  }

  return toMappedValue({
    original: configuration,
    mapped: {
      ...configuration,
      filter: wrapRecordFiltersOfFilter({
        filter: configuration.filter,
        flatFieldMetadataMaps,
      }),
    },
  });
};
