import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  public overrideFilterByFieldMetadata<
    T extends ObjectRecordFilter | undefined,
  >(
    filter: T,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): T {
    if (!isDefined(filter)) {
      return filter;
    }

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

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
            fieldIdByName,
            flatFieldMetadataMaps,
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
    fieldIdByName: Record<string, string>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    const fieldMetadataId = fieldIdByName[key];
    const fieldMetadata = fieldMetadataId
      ? flatFieldMetadataMaps.byId[fieldMetadataId]
      : undefined;

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
    fieldIdByName: Record<string, string>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    const fieldMetadata = flatFieldMetadataMaps.byId[fieldIdByName[key]];

    if (!fieldMetadata) {
      return value;
    }

    const processed = await this.recordInputTransformerService.process({
      recordInput: { [key]: value },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    return processed[key] ?? value;
  }
}
