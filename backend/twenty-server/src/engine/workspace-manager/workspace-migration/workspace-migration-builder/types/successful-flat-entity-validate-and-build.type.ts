import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalWorkspaceMigrationActionsRecord } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type SuccessfulFlatEntityValidateAndBuild<T extends AllMetadataName> = {
  status: 'success';
  actions: MetadataUniversalWorkspaceMigrationActionsRecord<T>;
};
