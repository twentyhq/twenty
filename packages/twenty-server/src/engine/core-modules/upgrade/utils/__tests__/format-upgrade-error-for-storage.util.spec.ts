import { CustomError } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

import { formatUpgradeErrorForStorage } from 'src/engine/core-modules/upgrade/utils/format-upgrade-error-for-storage.util';

const stripStack = (output: string): string =>
  output.replace(/\n\s+at .+/g, '');

describe('formatUpgradeErrorForStorage', () => {
  it('should format a QueryFailedError with driver details', () => {
    const driverError = new Error(
      'duplicate key value violates unique constraint "UQ_name"',
    );

    Object.assign(driverError, {
      code: '23505',
      detail: 'Key (name)=(foo) already exists.',
    });

    const error = new QueryFailedError(
      'INSERT INTO "core"."upgradeMigration" VALUES ($1)',
      [],
      driverError,
    );

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a QueryFailedError without driver code or detail', () => {
    const error = new QueryFailedError(
      'SELECT * FROM "missing_table"',
      [],
      new Error('relation "missing_table" does not exist'),
    );

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a WorkspaceMigrationRunnerException with INTERNAL_SERVER_ERROR', () => {
    const error = new WorkspaceMigrationRunnerException({
      message: 'Something went wrong internally',
      code: WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR,
    });

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a WorkspaceMigrationRunnerException with EXECUTION_FAILED', () => {
    const action = {
      type: 'create',
      metadataName: 'objectMetadata',
      flatEntity: { universalIdentifier: 'test-object-uid' },
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const error = new WorkspaceMigrationRunnerException({
      action,
      errors: {
        metadata: new Error('column "label" cannot be null'),
        workspaceSchema: new Error('table already exists'),
      },
      code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
    });

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should surface driver details of a QueryFailedError nested in an EXECUTION_FAILED', () => {
    const driverError = new Error(
      'duplicate key value violates unique constraint "IDX_PAGE_LAYOUT_WIDGET_UNIVERSAL_ID"',
    );

    Object.assign(driverError, {
      code: '23505',
      detail:
        'Key (universalIdentifier)=(f473b435-e2d4-4928-8d90-1db0094389f7) already exists.',
    });

    const action = {
      type: 'create',
      metadataName: 'pageLayoutWidget',
      flatEntity: {
        universalIdentifier: 'f473b435-e2d4-4928-8d90-1db0094389f7',
      },
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const error = new WorkspaceMigrationRunnerException({
      action,
      errors: {
        metadata: new QueryFailedError(
          'INSERT INTO "core"."pageLayoutWidget" VALUES ($1)',
          [],
          driverError,
        ),
      },
      code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
    });

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a WorkspaceMigrationBuilderException', () => {
    const report = {
      objectMetadata: [
        {
          validationErrors: ['name must not be empty'],
        },
      ],
    } as unknown as OrchestratorFailureReport;

    const error = new WorkspaceMigrationBuilderException({
      status: 'fail',
      report,
    });

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a CustomError with code', () => {
    const error = new CustomError('Workspace not found', 'WORKSPACE_NOT_FOUND');

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a generic Error', () => {
    const error = new Error('Something unexpected happened');

    expect(stripStack(formatUpgradeErrorForStorage(error))).toMatchSnapshot();
  });

  it('should format a string value', () => {
    expect(formatUpgradeErrorForStorage('raw string error')).toMatchSnapshot();
  });

  it('should format an undefined value', () => {
    expect(formatUpgradeErrorForStorage(undefined)).toMatchSnapshot();
  });

  it('should format a number value', () => {
    expect(formatUpgradeErrorForStorage(42)).toMatchSnapshot();
  });
});
