import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  FindDuplicatesResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  MergeManyResolverArgs,
  ResolverArgs,
  ResolverArgsType,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

type ArgPositionBackfillInput = {
  argIndex?: number;
  shouldBackfillPosition: boolean;
};

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

    const shouldBackfillPosition = Object.values(
      options.objectMetadataItemWithFieldMaps.fieldsById,
    ).some(
      (field) =>
        field.type === FieldMetadataType.POSITION && field.name === 'position',
    );

    switch (resolverArgsType) {
      case ResolverArgsType.CreateOne:
        return {
          ...args,
          data: await this.overrideDataByFieldMetadata(
            (args as CreateOneResolverArgs).data,
            options,
            {
              argIndex: 0,
              shouldBackfillPosition,
            },
          ),
        } satisfies CreateOneResolverArgs;
      case ResolverArgsType.CreateMany:
        return {
          ...args,
          data: await Promise.all(
            (args as CreateManyResolverArgs).data?.map((arg, index) =>
              this.overrideDataByFieldMetadata(arg, options, {
                argIndex: index,
                shouldBackfillPosition,
              }),
            ) ?? [],
          ),
        } satisfies CreateManyResolverArgs;
      case ResolverArgsType.UpdateOne:
        return {
          ...args,
          id: (args as UpdateOneResolverArgs).id,
          data: await this.overrideDataByFieldMetadata(
            (args as UpdateOneResolverArgs).data,
            options,
            {
              argIndex: 0,
              shouldBackfillPosition: false,
            },
          ),
        } satisfies UpdateOneResolverArgs;
      case ResolverArgsType.UpdateMany:
        return {
          ...args,
          filter: this.overrideFilterByFieldMetadata(
            (args as UpdateManyResolverArgs).filter,
            options.objectMetadataItemWithFieldMaps,
          ),
          data: await this.overrideDataByFieldMetadata(
            (args as UpdateManyResolverArgs).data,
            options,
            {
              argIndex: 0,
              shouldBackfillPosition: false,
            },
          ),
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
              ),
            ) ?? [],
          )) as string[],
          data: await Promise.all(
            (args as FindDuplicatesResolverArgs).data?.map((arg, index) =>
              this.overrideDataByFieldMetadata(arg, options, {
                argIndex: index,
                shouldBackfillPosition,
              }),
            ) ?? [],
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
    data: Partial<ObjectRecord> | undefined,
    options: WorkspaceQueryRunnerOptions,
    argPositionBackfillInput: ArgPositionBackfillInput,
  ): Promise<Partial<ObjectRecord>> {
    if (!isDefined(data)) {
      return Promise.resolve({});
    }

    const workspace = options.authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    let isFieldPositionPresent = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createArgByArgKeyPromises: Promise<[string, any]>[] = Object.entries(
      data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).map(async ([key, value]): Promise<[string, any]> => {
      const fieldMetadataId =
        options.objectMetadataItemWithFieldMaps.fieldIdByName[key];
      const fieldMetadata =
        options.objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

      if (!fieldMetadata) {
        return [key, value];
      }

      switch (fieldMetadata.type) {
        case FieldMetadataType.POSITION: {
          isFieldPositionPresent = true;

          const newValue = await this.recordPositionService.buildRecordPosition(
            {
              value,
              workspaceId: workspace.id,
              objectMetadata: {
                isCustom: options.objectMetadataItemWithFieldMaps.isCustom,
                nameSingular:
                  options.objectMetadataItemWithFieldMaps.nameSingular,
              },
              index: argPositionBackfillInput.argIndex,
            },
          );

          return [key, newValue];
        }
        case FieldMetadataType.NUMBER:
        case FieldMetadataType.RICH_TEXT:
        case FieldMetadataType.PHONES:
        case FieldMetadataType.RICH_TEXT_V2:
        case FieldMetadataType.LINKS:
        case FieldMetadataType.EMAILS: {
          const transformedValue =
            await this.recordInputTransformerService.transformFieldValue(
              fieldMetadata.type,
              value,
            );

          return [key, transformedValue];
        }
        default:
          return [key, value];
      }
    });

    const newArgEntries = await Promise.all(createArgByArgKeyPromises);

    if (
      !isFieldPositionPresent &&
      argPositionBackfillInput.shouldBackfillPosition
    ) {
      return Object.fromEntries([
        ...newArgEntries,
        [
          'position',
          await this.recordPositionService.buildRecordPosition({
            value: 'first',
            workspaceId: workspace.id,
            objectMetadata: {
              isCustom: options.objectMetadataItemWithFieldMaps.isCustom,
              nameSingular:
                options.objectMetadataItemWithFieldMaps.nameSingular,
            },
            index: argPositionBackfillInput.argIndex,
          }),
        ],
      ]);
    }

    return Object.fromEntries(newArgEntries);
  }

  private overrideFilterByFieldMetadata(
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
  ) {
    const fieldMetadata = fieldMetadataMapByName[key];

    if (!fieldMetadata) {
      return value;
    }

    return this.recordInputTransformerService.transformFieldValue(
      fieldMetadata.type,
      value,
    );
  }
}
