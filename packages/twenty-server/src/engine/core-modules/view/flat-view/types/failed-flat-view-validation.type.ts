import { type FailedFlatViewValidationMinimalInformation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-validation-minimal-information.type';
import { type FlatViewValidationError } from 'src/engine/core-modules/view/flat-view/types/flat-view-validation-error.type';
import { type WorkspaceMigrationViewActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';

export type FailedFlatViewValidation = {
  type: WorkspaceMigrationViewActionTypeV2;
  viewLevelErrors: FlatViewValidationError[];
  failedViewValidationMinimalInformation: Partial<FailedFlatViewValidationMinimalInformation>;
};
