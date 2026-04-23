import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type WorkspaceSchemaContextForMigration = {
  schemaName: string;
  tableName: string;
};

export const getWorkspaceSchemaContextForMigration = ({
  workspaceId,
  objectMetadata,
}: {
  workspaceId: string;
  objectMetadata: Pick<
    FlatObjectMetadata | UniversalFlatObjectMetadata,
    'nameSingular' | 'isCustom'
  >;
}): WorkspaceSchemaContextForMigration => {
  return {
    schemaName: getWorkspaceSchemaName(workspaceId),
    tableName: computeObjectTargetTable(objectMetadata),
  };
};
