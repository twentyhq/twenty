import { InputTypeDefinitionKind } from 'src/engine/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { FieldMetadataType } from 'src/engine-metadata/field-metadata/field-metadata.entity';

export interface ArgMetadata<T = any> {
  kind?: InputTypeDefinitionKind;
  type?: FieldMetadataType;
  isNullable?: boolean;
  isArray?: boolean;
  defaultValue?: T;
}

export interface ArgsMetadata {
  args: {
    [key: string]: ArgMetadata;
  };
  objectMetadataId: string;
}
