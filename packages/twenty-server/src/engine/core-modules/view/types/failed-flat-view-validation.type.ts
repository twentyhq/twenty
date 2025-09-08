import { type FailedViewValidationMinimalInformation } from 'src/engine/core-modules/view/types/failed-view-validation-minimal-information.type';
import { type FlatViewValidationError } from 'src/engine/core-modules/view/types/flat-view-validation-error.type';
import { type WorkspaceMigrationViewActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';

export type FailedFlatViewValidation = {
  type: WorkspaceMigrationViewActionTypeV2['type'];
  viewLevelErrors: FlatViewValidationError[];
  failedViewValidationMinimalInformation: Partial<FailedViewValidationMinimalInformation>;
};
