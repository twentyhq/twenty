import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

import { RecordPositionFactory } from './record-position.factory';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(private readonly recordPositionFactory: RecordPositionFactory) {}

  async create(
    args: Record<string, any>,
    options: WorkspaceQueryRunnerOptions,
  ) {
    const fieldMetadataCollection = options.fieldMetadataCollection;

    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((fieldMetadata) => [
        fieldMetadata.name,
        fieldMetadata,
      ]),
    );

    return {
      data: await Promise.all(
        args.data.map((arg) =>
          this.overrideArgByFieldMetadata(arg, options, fieldMetadataMap),
        ),
      ),
    };
  }

  private async overrideArgByFieldMetadata(
    arg: Record<string, any>,
    options: WorkspaceQueryRunnerOptions,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    const createArgPromiseByArgKey = Object.entries(arg).map(
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
          default:
            return [key, await Promise.resolve(value)];
        }
      },
    );

    const newArgEntries = await Promise.all(createArgPromiseByArgKey);

    return Object.fromEntries(newArgEntries);
  }
}
