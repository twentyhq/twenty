import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const isMigrationEntityNotFoundError = (error: unknown): boolean =>
  error instanceof WorkspaceMigrationRunnerException &&
  error.errors?.actionTranspilation instanceof FlatEntityMapsException &&
  error.errors.actionTranspilation.code ===
    FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND;
