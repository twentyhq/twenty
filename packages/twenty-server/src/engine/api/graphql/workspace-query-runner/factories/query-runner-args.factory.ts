import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

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
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

import { RecordPositionFactory } from './record-position.factory';

type ArgPositionBackfillInput = {
  argIndex?: number;
  shouldBackfillPosition: boolean;
};

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(private readonly recordPositionFactory: RecordPositionFactory) {}

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
      case ResolverArgsType.FindOne:
        return {
          ...args,
          filter: await this.overrideFilterByFieldMetadata(
            (args as FindOneResolverArgs).filter,
            fieldMetadataMapByNameByName,
          ),
        };
      case ResolverArgsType.FindMany:
        return {
          ...args,
          filter: await this.overrideFilterByFieldMetadata(
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
  ) {
    if (!data) {
      return;
    }

    let isFieldPositionPresent = false;

    const createArgPromiseByArgKey = Object.entries(data).map(
      async ([key, value]) => {
        const fieldMetadata = fieldMetadataMapByNameByName[key];

        if (!fieldMetadata) {
          return [key, await Promise.resolve(value)];
        }

        switch (fieldMetadata.type) {
          case FieldMetadataType.POSITION:
            isFieldPositionPresent = true;

            return [
              key,
              await this.recordPositionFactory.create(
                value,
                {
                  isCustom: options.objectMetadataItemWithFieldMaps.isCustom,
                  nameSingular:
                    options.objectMetadataItemWithFieldMaps.nameSingular,
                },
                options.authContext.workspace.id,
                argPositionBackfillInput.argIndex,
              ),
            ];
          case FieldMetadataType.NUMBER:
            return [key, Number(value)];
          default:
            return [key, await Promise.resolve(value)];
        }
      },
    );

    const newArgEntries = await Promise.all(createArgPromiseByArgKey);

    if (
      !isFieldPositionPresent &&
      argPositionBackfillInput.shouldBackfillPosition
    ) {
      return Object.fromEntries([
        ...newArgEntries,
        [
          'position',
          await this.recordPositionFactory.create(
            'first',
            {
              isCustom: options.objectMetadataItemWithFieldMaps.isCustom,
              nameSingular:
                options.objectMetadataItemWithFieldMaps.nameSingular,
            },
            options.authContext.workspace.id,
            argPositionBackfillInput.argIndex,
          ),
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

    switch (fieldMetadata.type) {
      case 'NUMBER': {
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

    switch (fieldMetadata.type) {
      case FieldMetadataType.NUMBER:
        return Number(value);
      default:
        return value;
    }
  }
}
