import { Injectable } from '@nestjs/common';

import { GraphQLInputObjectType } from 'graphql';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { FieldFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/field.factory';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

export enum InputTypeDefinitionKind {
  Create = 'Create',
  Update = 'Update',
  Filter = 'Filter',
  OrderBy = 'OrderBy',
}

export interface InputTypeDefinition {
  target: string;
  kind: InputTypeDefinitionKind;
  type: GraphQLInputObjectType;
}

@Injectable()
export class InputTypeDefinitionFactory {
  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly fieldFactory: FieldFactory,
  ) {}

  public create({
    objectMetadata,
    kind,
    options,
  }: {
    objectMetadata: ObjectMetadataEntity;
    kind: InputTypeDefinitionKind;
    options: WorkspaceBuildSchemaOptions;
  }): InputTypeDefinition {
    // @ts-expect-error legacy noImplicitAny
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}Input`,
      description: objectMetadata.description,
      // @ts-expect-error legacy noImplicitAny
      fields: () => {
        switch (kind) {
          /**
           * Filter input type has additional fields for filtering and is self referencing
           */
          case InputTypeDefinitionKind.Filter: {
            // @ts-expect-error legacy noImplicitAny
            const andOrType = this.typeMapperService.mapToGqlType(inputType, {
              isArray: true,
              arrayDepth: 1,
              nullable: true,
            });

            return {
              ...this.fieldFactory.create({
                objectMetadata,
                kind,
                options,
              }),
              and: {
                type: andOrType,
              },
              or: {
                type: andOrType,
              },
              not: {
                type: this.typeMapperService.mapToGqlType(inputType, {
                  nullable: true,
                }),
              },
            };
          }
          /**
           * Other input types are generated with fields only
           */
          default:
            return this.fieldFactory.create({
              objectMetadata,
              kind,
              options,
            });
        }
      },
    });

    return {
      target: objectMetadata.id,
      kind,
      type: inputType,
    };
  }
}
