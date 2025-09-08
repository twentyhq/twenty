import { type FailedViewFieldValidationMinimalInformation } from 'src/engine/core-modules/view/types/failed-view-field-validation-minimal-information.type';
import { type FlatViewFieldValidationError } from 'src/engine/core-modules/view/types/flat-view-field-validation-error.type';
import { type WorkspaceMigrationViewFieldActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';

export type FailedFlatViewFieldValidation = {
  type: WorkspaceMigrationViewFieldActionTypeV2['type'];
  viewFieldLevelErrors: FlatViewFieldValidationError[];
  failedViewFieldValidationMinimalInformation: Partial<FailedViewFieldValidationMinimalInformation>;
};
