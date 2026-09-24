import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

import { classifyMetadataError } from '@/metadata-error-handler/utils/classifyMetadataError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'Migration refused', extensions }],
  });

describe('classifyMetadataError', () => {
  it('should classify a deferred actions conflict and keep its user friendly message', () => {
    const classification = classifyMetadataError({
      error: buildError({
        code: 'CONFLICT',
        subCode:
          WorkspaceMigrationV2ExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
        userFriendlyMessage: 'Still applying your previous change.',
      }),
      primaryMetadataName: 'objectMetadata',
    });

    expect(classification).toEqual({
      type: 'v2-conflict',
      userFriendlyMessage: 'Still applying your previous change.',
    });
  });

  it('should still classify runner internal errors as internal', () => {
    const classification = classifyMetadataError({
      error: buildError({
        subCode: WorkspaceMigrationV2ExceptionCode.RUNNER_INTERNAL_SERVER_ERROR,
        userFriendlyMessage: 'Something broke.',
      }),
      primaryMetadataName: 'objectMetadata',
    });

    expect(classification.type).toBe('v2-internal');
  });

  it('should fall back to v1 for an error without extensions', () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: 'Boom' }],
    });

    expect(
      classifyMetadataError({ error, primaryMetadataName: 'objectMetadata' })
        .type,
    ).toBe('v1');
  });
});
