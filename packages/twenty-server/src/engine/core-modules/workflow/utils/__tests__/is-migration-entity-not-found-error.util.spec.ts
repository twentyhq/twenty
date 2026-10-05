import { isMigrationEntityNotFoundError } from 'src/engine/core-modules/workflow/utils/is-migration-entity-not-found-error.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

const DELETE_WORKFLOW_VERSION_ACTION = {
  type: 'delete',
  metadataName: 'workflowVersion',
  universalIdentifier: 'workflow-version',
} as AllUniversalWorkspaceMigrationAction;

const buildTranspilationError = (error: Error) =>
  new WorkspaceMigrationRunnerException({
    action: DELETE_WORKFLOW_VERSION_ACTION,
    errors: { actionTranspilation: error },
    code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
  });

describe('isMigrationEntityNotFoundError', () => {
  it('matches an action that targets an entity missing from the maps', () => {
    expect(
      isMigrationEntityNotFoundError(
        buildTranspilationError(
          new FlatEntityMapsException(
            'Could not find flat entity',
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          ),
        ),
      ),
    ).toBe(true);
  });

  it('ignores every other failure', () => {
    expect(
      isMigrationEntityNotFoundError(
        buildTranspilationError(new Error('Something else')),
      ),
    ).toBe(false);
    expect(
      isMigrationEntityNotFoundError(
        new WorkspaceMigrationRunnerException({
          action: DELETE_WORKFLOW_VERSION_ACTION,
          errors: { metadata: new Error('Post commit failure') },
          code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
        }),
      ),
    ).toBe(false);
    expect(isMigrationEntityNotFoundError(new Error('Plain error'))).toBe(
      false,
    );
  });
});
