import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type WorkflowManifestObjectReference = Pick<
  FlatObjectMetadata,
  'nameSingular'
> &
  Partial<
    Pick<
      FlatObjectMetadata,
      'labelIdentifierFieldMetadataUniversalIdentifier' | 'namePlural'
    >
  >;

export type WorkflowManifestFieldReference = {
  objectUniversalIdentifier: string;
} & Pick<
  FlatFieldMetadata,
  | 'id'
  | 'name'
  | 'type'
  | 'settings'
  | 'relationTargetObjectMetadataUniversalIdentifier'
> &
  Partial<Pick<FlatFieldMetadata, 'universalSettings'>>;

export type WorkflowManifestReferences = {
  logicFunctionOutputSchemaByUniversalIdentifier?: ReadonlyMap<
    string,
    BaseOutputSchemaV2
  >;
  agentOutputSchemaByUniversalIdentifier?: ReadonlyMap<
    string,
    BaseOutputSchemaV2
  >;
  logicFunctionIdByUniversalIdentifier: ReadonlyMap<string, string>;
  agentIdByUniversalIdentifier?: ReadonlyMap<string, string>;
  objectByUniversalIdentifier?: ReadonlyMap<
    string,
    WorkflowManifestObjectReference
  >;
  fieldByUniversalIdentifier?: ReadonlyMap<
    string,
    WorkflowManifestFieldReference
  >;
};
