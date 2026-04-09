import { type QueryRunner } from 'typeorm';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  type AllFlatWorkspaceMigrationAction,
  type AllUniversalWorkspaceMigrationAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigrationActionRunnerArgs<
  TUniversalAction extends AllUniversalWorkspaceMigrationAction,
> = {
  queryRunner: QueryRunner;
  action: TUniversalAction;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
  flatApplication: FlatApplication;
};

export type WorkspaceMigrationActionRunnerContext<
  TFlatAction extends AllFlatWorkspaceMigrationAction,
  TUniversalAction extends
    AllUniversalWorkspaceMigrationAction = AllUniversalWorkspaceMigrationAction,
> = WorkspaceMigrationActionRunnerArgs<TUniversalAction> & {
  flatAction: TFlatAction;
};
