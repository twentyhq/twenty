import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { type FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(
    private readonly recordPositionService: RecordPositionService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  public overrideFilterByFieldMetadata<
    T extends ObjectRecordFilter | undefined,
  >(
    filter: T,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): T {
    if (!isDefined(filter)) {
      return filter;
    }

    const overrideFilter = (filterObject: ObjectRecordFilter) => {
      return Object.entries(filterObject).reduce((acc, [key, value]) => {
        if (key === 'and' || key === 'or') {
          // @ts-expect-error legacy noImplicitAny
          acc[key] = value.map((nestedFilter: ObjectRecordFilter) =>
            overrideFilter(nestedFilter),
          );
        } else if (key === 'not') {
          // @ts-expect-error legacy noImplicitAny
          acc[key] = overrideFilter(value);
        } else {
          // @ts-expect-error legacy noImplicitAny
          acc[key] = this.transformFilterValueByType(
            key,
            value,
            objectMetadataItemWithFieldMaps,
          );
        }

        return acc;
      }, {});
    };

    return overrideFilter(filter) as T;
  }

  private transformFilterValueByType(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    const fieldMetadataId = objectMetadataItemWithFieldMaps.fieldIdByName[key];
    const fieldMetadata =
      objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

    if (!fieldMetadata) {
      return value;
    }

    // Special handling for filter values, which have a specific structure
    switch (fieldMetadata.type) {
      case FieldMetadataType.NUMBER: {
        if (value?.is === 'NULL') {
          return value;
        } else {
          return Object.fromEntries(
            Object.entries(value).map(([filterKey, filterValue]) => [
              filterKey,
              Number(filterValue),
            ]),
          );
        }
      }
      default:
        return value;
    }
  }

  async overrideValueByFieldMetadata(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    fieldMetadataMapByName: FieldMetadataMap,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    const fieldMetadata = fieldMetadataMapByName[key];

    if (!fieldMetadata) {
      return value;
    }

    return this.recordInputTransformerService.process({
      recordInput: { [key]: value },
      objectMetadataMapItem: objectMetadataItemWithFieldMaps,
    });
  }
}
