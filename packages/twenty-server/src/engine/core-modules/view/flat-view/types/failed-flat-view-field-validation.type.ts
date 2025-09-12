import { type FailedFlatViewFieldValidationMinimalInformation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-field-validation-minimal-information.type';
import { type FlatViewFieldValidationError } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-validation-error.type';
import { type WorkspaceMigrationViewFieldActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';

export type FailedFlatViewFieldValidation = {
  type: WorkspaceMigrationViewFieldActionTypeV2;
  viewFieldLevelErrors: FlatViewFieldValidationError[];
  failedViewFieldValidationMinimalInformation: Partial<FailedFlatViewFieldValidationMinimalInformation>;
};
