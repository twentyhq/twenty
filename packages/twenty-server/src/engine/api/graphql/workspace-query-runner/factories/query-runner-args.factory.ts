import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecord,
  type ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  type CreateManyResolverArgs,
  type CreateOneResolverArgs,
  type FindDuplicatesResolverArgs,
  type FindManyResolverArgs,
  type FindOneResolverArgs,
  type MergeManyResolverArgs,
  type ResolverArgs,
  ResolverArgsType,
  type UpdateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { type FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(
    private readonly recordPositionService: RecordPositionService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async create(
    args: ResolverArgs,
    options: WorkspaceQueryRunnerOptions,
    resolverArgsType: ResolverArgsType,
  ) {
    const fieldMetadataMapByNameByName =
      options.objectMetadataItemWithFieldMaps.fieldsById;

    switch (resolverArgsType) {
      case ResolverArgsType.CreateOne:
        return {
          ...args,
          data: (
            await this.overrideDataByFieldMetadata(
              [(args as CreateOneResolverArgs).data],
              options,
            )
          )[0],
        } satisfies CreateOneResolverArgs;
      case ResolverArgsType.CreateMany:
        return {
          ...args,
          data: await this.overrideDataByFieldMetadata(
            (args as CreateManyResolverArgs).data,
            options,
          ),
        } satisfies CreateManyResolverArgs;
      case ResolverArgsType.UpdateOne:
        return {
          ...args,
          id: (args as UpdateOneResolverArgs).id,
          data: (
            await this.overrideDataByFieldMetadata(
              [(args as UpdateOneResolverArgs).data],
              options,
              false,
            )
          )[0],
        } satisfies UpdateOneResolverArgs;
      case ResolverArgsType.UpdateMany:
        return {
          ...args,
          filter: this.overrideFilterByFieldMetadata(
            (args as UpdateManyResolverArgs).filter,
            options.objectMetadataItemWithFieldMaps,
          ),
          data: (
            await this.overrideDataByFieldMetadata(
              [(args as UpdateManyResolverArgs).data],
              options,
              false,
            )
          )[0],
        } satisfies UpdateManyResolverArgs;
      case ResolverArgsType.FindOne:
        return {
          ...args,
          filter: this.overrideFilterByFieldMetadata(
            (args as FindOneResolverArgs).filter,
            options.objectMetadataItemWithFieldMaps,
          ),
        };
      case ResolverArgsType.FindMany:
        return {
          ...args,
          filter: this.overrideFilterByFieldMetadata(
            (args as FindManyResolverArgs).filter,
            options.objectMetadataItemWithFieldMaps,
          ),
        };

      case ResolverArgsType.FindDuplicates:
        return {
          ...args,
          ids: (await Promise.all(
            (args as FindDuplicatesResolverArgs).ids?.map((id) =>
              this.overrideValueByFieldMetadata(
                'id',
                id,
                fieldMetadataMapByNameByName,
                options.objectMetadataItemWithFieldMaps,
              ),
            ) ?? [],
          )) as string[],
          data: await this.overrideDataByFieldMetadata(
            (args as FindDuplicatesResolverArgs).data,
            options,
            false,
          ),
        } satisfies FindDuplicatesResolverArgs;
      case ResolverArgsType.MergeMany:
        return {
          ...args,
          ids: (await Promise.all(
            (args as MergeManyResolverArgs).ids?.map((id) =>
              this.overrideValueByFieldMetadata(
                'id',
                id,
                fieldMetadataMapByNameByName,
                options.objectMetadataItemWithFieldMaps,
              ),
            ) ?? [],
          )) as string[],
          conflictPriorityIndex: (args as MergeManyResolverArgs)
            .conflictPriorityIndex,
          dryRun: (args as MergeManyResolverArgs).dryRun,
        } satisfies MergeManyResolverArgs;
      default:
        return args;
    }
  }

  private async overrideDataByFieldMetadata(
    partialRecordInputs: Partial<ObjectRecord>[] | undefined,
    options: WorkspaceQueryRunnerOptions,
    shouldBackfillPositionIfUndefined = true,
  ): Promise<Partial<ObjectRecord>[]> {
    if (!isDefined(partialRecordInputs)) {
      return [];
    }

    const allOverriddenRecords: Partial<ObjectRecord>[] = [];

    const workspace = options.authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const overriddenPositionRecords =
      await this.recordPositionService.overridePositionOnRecords({
        partialRecordInputs,
        workspaceId: workspace.id,
        objectMetadata: {
          isCustom: options.objectMetadataItemWithFieldMaps.isCustom,
          nameSingular: options.objectMetadataItemWithFieldMaps.nameSingular,
          fieldIdByName: options.objectMetadataItemWithFieldMaps.fieldIdByName,
        },
        shouldBackfillPositionIfUndefined,
      });

    for (const record of overriddenPositionRecords) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createArgByArgKey: [string, any][] = await Promise.all(
        Object.entries(record).map(async ([key, value]) => {
          const fieldMetadataId =
            options.objectMetadataItemWithFieldMaps.fieldIdByName[key];
          const fieldMetadata =
            options.objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

          if (!fieldMetadata) {
            return [key, value];
          }

          switch (fieldMetadata.type) {
            case FieldMetadataType.NUMBER:
            case FieldMetadataType.RICH_TEXT:
            case FieldMetadataType.PHONES:
            case FieldMetadataType.RICH_TEXT_V2:
            case FieldMetadataType.LINKS:
            case FieldMetadataType.EMAILS: {
              const transformedRecord =
                await this.recordInputTransformerService.process({
                  recordInput: { [key]: value },
                  objectMetadataMapItem:
                    options.objectMetadataItemWithFieldMaps,
                });

              return [key, transformedRecord[key]];
            }
            default:
              return [key, value];
          }
        }),
      );

      allOverriddenRecords.push(Object.fromEntries(createArgByArgKey));
    }

    return allOverriddenRecords;
  }

  public overrideFilterByFieldMetadata(
    filter: ObjectRecordFilter | undefined,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    if (!filter) {
      return;
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

    return overrideFilter(filter);
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

  private async overrideValueByFieldMetadata(
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
