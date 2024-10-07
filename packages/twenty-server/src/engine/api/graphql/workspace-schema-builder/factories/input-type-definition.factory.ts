import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { GraphQLInputObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { generateFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/generate-fields.utils';
import { pascalCase } from 'src/utils/pascal-case';

import { InputTypeFactory } from './input-type.factory';

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
    @Inject(forwardRef(() => InputTypeFactory))
    private readonly inputTypeFactory: CircularDep<InputTypeFactory>,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): InputTypeDefinition {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}Input`,
      description: objectMetadata.description,
      fields: () => {
        switch (kind) {
          /**
           * Filter input type has additional fields for filtering and is self referencing
           */
          case InputTypeDefinitionKind.Filter: {
            const andOrType = this.typeMapperService.mapToGqlType(inputType, {
              isArray: true,
              arrayDepth: 1,
              nullable: true,
            });

            return {
              ...generateFields(
                objectMetadata,
                kind,
                options,
                this.inputTypeFactory,
              ),
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
            return generateFields(
              objectMetadata,
              kind,
              options,
              this.inputTypeFactory,
            );
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
