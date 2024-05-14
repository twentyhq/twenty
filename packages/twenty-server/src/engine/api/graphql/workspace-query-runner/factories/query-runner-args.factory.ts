import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  CreateManyResolverArgs,
  FindDuplicatesResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  ResolverArgs,
  ResolverArgsType,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

import { RecordPositionFactory } from './record-position.factory';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(private readonly recordPositionFactory: RecordPositionFactory) {}

  async create(
    args: ResolverArgs,
    options: WorkspaceQueryRunnerOptions,
    resolverArgsType: ResolverArgsType,
  ) {
    const fieldMetadataCollection = options.fieldMetadataCollection;

    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((fieldMetadata) => [
        fieldMetadata.name,
        fieldMetadata,
      ]),
    );

    switch (resolverArgsType) {
      case ResolverArgsType.CreateMany:
        return {
          ...args,
          data: await Promise.all(
            (args as CreateManyResolverArgs).data.map((arg) =>
              this.overrideDataByFieldMetadata(arg, options, fieldMetadataMap),
            ),
          ),
        } satisfies CreateManyResolverArgs;
      case ResolverArgsType.FindOne:
        return {
          ...args,
          filter: await this.overrideFilterByFieldMetadata(
            (args as FindOneResolverArgs).filter,
            fieldMetadataMap,
          ),
        };
      case ResolverArgsType.FindMany:
        return {
          ...args,
          filter: await this.overrideFilterByFieldMetadata(
            (args as FindManyResolverArgs).filter,
            fieldMetadataMap,
          ),
        };

      case ResolverArgsType.FindDuplicates:
        return {
          ...args,
          id: await this.overrideValueByFieldMetadata(
            'id',
            (args as FindDuplicatesResolverArgs).id,
            fieldMetadataMap,
          ),
          data: await this.overrideDataByFieldMetadata(
            (args as FindDuplicatesResolverArgs).data,
            options,
            fieldMetadataMap,
          ),
        };
      default:
        return args;
    }
  }

  private async overrideDataByFieldMetadata(
    data: Record<string, any> | undefined,
    options: WorkspaceQueryRunnerOptions,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    if (!data) {
      return;
    }

    const createArgPromiseByArgKey = Object.entries(data).map(
      async ([key, value]) => {
        const fieldMetadata = fieldMetadataMap.get(key);

        if (!fieldMetadata) {
          return [key, await Promise.resolve(value)];
        }

        switch (fieldMetadata.type) {
          case FieldMetadataType.POSITION:
            return [
              key,
              await this.recordPositionFactory.create(
                value,
                {
                  isCustom: options.objectMetadataItem.isCustom,
                  nameSingular: options.objectMetadataItem.nameSingular,
                },
                options.workspaceId,
              ),
            ];
          case FieldMetadataType.NUMBER:
            return [key, await Promise.resolve(Number(value))];
          default:
            return [key, await Promise.resolve(value)];
        }
      },
    );

    const newArgEntries = await Promise.all(createArgPromiseByArgKey);

    return Object.fromEntries(newArgEntries);
  }

  private overrideFilterByFieldMetadata(
    filter: RecordFilter | undefined,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    if (!filter) {
      return;
    }

    const overrideFilter = (filterObject: RecordFilter) => {
      return Object.entries(filterObject).reduce((acc, [key, value]) => {
        if (key === 'and' || key === 'or') {
          acc[key] = value.map((nestedFilter: RecordFilter) =>
            overrideFilter(nestedFilter),
          );
        } else if (key === 'not') {
          acc[key] = overrideFilter(value);
        } else {
          acc[key] = this.transformValueByType(key, value, fieldMetadataMap);
        }

        return acc;
      }, {});
    };

    return overrideFilter(filter);
  }

  private transformValueByType(
    key: string,
    value: any,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    const fieldMetadata = fieldMetadataMap.get(key);

    if (!fieldMetadata) {
      return value;
    }
    switch (fieldMetadata.type) {
      case 'NUMBER':
        return Object.fromEntries(
          Object.entries(value).map(([filterKey, filterValue]) => [
            filterKey,
            Number(filterValue),
          ]),
        );
      default:
        return value;
    }
  }

  private async overrideValueByFieldMetadata(
    key: string,
    value: any,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    const fieldMetadata = fieldMetadataMap.get(key);

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
