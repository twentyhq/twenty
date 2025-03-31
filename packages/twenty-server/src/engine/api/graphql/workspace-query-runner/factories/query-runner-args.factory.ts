import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

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
  ResolverArgs,
  ResolverArgsType,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';

import { RecordPositionFactory } from './record-position.factory';

type ArgPositionBackfillInput = {
  argIndex?: number;
  shouldBackfillPosition: boolean;
};

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(
    private readonly recordPositionFactory: RecordPositionFactory,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async create(
    args: ResolverArgs,
    options: WorkspaceQueryRunnerOptions,
    resolverArgsType: ResolverArgsType,
  ) {
    const fieldMetadataMapByNameByName =
      options.objectMetadataItemWithFieldMaps.fieldsByName;

    const shouldBackfillPosition =
      options.objectMetadataItemWithFieldMaps.fields.some(
        (field) =>
          field.type === FieldMetadataType.POSITION &&
          field.name === 'position',
      );

    switch (resolverArgsType) {
      case ResolverArgsType.CreateOne:
        return {
          ...args,
          data: await this.overrideDataByFieldMetadata(
            (args as CreateOneResolverArgs).data,
            options,
            fieldMetadataMapByNameByName,
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
              this.overrideDataByFieldMetadata(
                arg,
                options,
                fieldMetadataMapByNameByName,
                {
                  argIndex: index,
                  shouldBackfillPosition,
                },
              ),
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
            fieldMetadataMapByNameByName,
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
            fieldMetadataMapByNameByName,
          ),
          data: await this.overrideDataByFieldMetadata(
            (args as UpdateManyResolverArgs).data,
            options,
            fieldMetadataMapByNameByName,
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
            fieldMetadataMapByNameByName,
          ),
        };
      case ResolverArgsType.FindMany:
        return {
          ...args,
          filter: this.overrideFilterByFieldMetadata(
            (args as FindManyResolverArgs).filter,
            fieldMetadataMapByNameByName,
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
              this.overrideDataByFieldMetadata(
                arg,
                options,
                fieldMetadataMapByNameByName,
                {
                  argIndex: index,
                  shouldBackfillPosition,
                },
              ),
            ) ?? [],
          ),
        } satisfies FindDuplicatesResolverArgs;
      default:
        return args;
    }
  }

  private async overrideDataByFieldMetadata(
    data: Partial<ObjectRecord> | undefined,
    options: WorkspaceQueryRunnerOptions,
    fieldMetadataMapByNameByName: Record<string, FieldMetadataInterface>,
    argPositionBackfillInput: ArgPositionBackfillInput,
  ): Promise<Partial<ObjectRecord>> {
    if (!data) {
      return Promise.resolve({});
    }

    const workspaceId = options.authContext.workspace.id;
    let isFieldPositionPresent = false;

    const createArgByArgKeyPromises: Promise<[string, any]>[] = Object.entries(
      data,
    ).map(async ([key, value]): Promise<[string, any]> => {
      const fieldMetadata = fieldMetadataMapByNameByName[key];

      if (!fieldMetadata) {
        return [key, value];
      }

      switch (fieldMetadata.type) {
        case FieldMetadataType.POSITION: {
          isFieldPositionPresent = true;

          const newValue = await this.recordPositionFactory.create({
            value,
            workspaceId,
            objectMetadata: {
              isCustom: options.objectMetadataItemWithFieldMaps.isCustom,
              nameSingular:
                options.objectMetadataItemWithFieldMaps.nameSingular,
            },
            index: argPositionBackfillInput.argIndex,
          });

          return [key, newValue];
        }
        case FieldMetadataType.NUMBER:
        case FieldMetadataType.RICH_TEXT:
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
          await this.recordPositionFactory.create({
            value: 'first',
            workspaceId,
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
    fieldMetadataMapByName: Record<string, FieldMetadataInterface>,
  ) {
    if (!filter) {
      return;
    }

    const overrideFilter = (filterObject: ObjectRecordFilter) => {
      return Object.entries(filterObject).reduce((acc, [key, value]) => {
        if (key === 'and' || key === 'or') {
          acc[key] = value.map((nestedFilter: ObjectRecordFilter) =>
            overrideFilter(nestedFilter),
          );
        } else if (key === 'not') {
          acc[key] = overrideFilter(value);
        } else {
          acc[key] = this.transformValueByType(
            key,
            value,
            fieldMetadataMapByName,
          );
        }

        return acc;
      }, {});
    };

    return overrideFilter(filter);
  }

  private transformValueByType(
    key: string,
    value: any,
    fieldMetadataMapByName: FieldMetadataMap,
  ) {
    const fieldMetadata = fieldMetadataMapByName[key];

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
