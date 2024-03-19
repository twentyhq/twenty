import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ArgMetadata } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/param-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';

export const getResolverArgs = (
  type: WorkspaceResolverBuilderMethodNames,
): { [key: string]: ArgMetadata } => {
  switch (type) {
    case 'findMany':
      return {
        first: {
          type: FieldMetadataType.NUMBER,
          isNullable: true,
        },
        last: {
          type: FieldMetadataType.NUMBER,
          isNullable: true,
        },
        before: {
          type: FieldMetadataType.TEXT,
          isNullable: true,
        },
        after: {
          type: FieldMetadataType.TEXT,
          isNullable: true,
        },
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: true,
        },
        orderBy: {
          kind: InputTypeDefinitionKind.OrderBy,
          isNullable: true,
        },
      };
    case 'findOne':
    case 'deleteMany':
      return {
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'createMany':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
          isArray: true,
        },
      };
    case 'createOne':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
        },
      };
    case 'updateOne':
      return {
        id: {
          type: FieldMetadataType.UUID,
          isNullable: false,
        },
        data: {
          kind: InputTypeDefinitionKind.Update,
          isNullable: false,
        },
      };
    case 'findDuplicates':
      return {
        id: {
          type: FieldMetadataType.UUID,
          isNullable: true,
        },
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: true,
        },
      };
    case 'deleteOne':
      return {
        id: {
          type: FieldMetadataType.UUID,
          isNullable: false,
        },
      };
    case 'executeQuickActionOnOne':
      return {
        id: {
          type: FieldMetadataType.UUID,
          isNullable: false,
        },
      };
    case 'updateMany':
      return {
        data: {
          kind: InputTypeDefinitionKind.Update,
          isNullable: false,
        },
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
