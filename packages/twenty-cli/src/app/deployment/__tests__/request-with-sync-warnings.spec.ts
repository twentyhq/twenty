import { describe, expect, it, vi } from 'vitest';

import { requestWithSyncWarnings } from '@/app/deployment/request-with-sync-warnings';
import { CliError } from '@/output/cli-error';

const buildGraphqlError = (details: Record<string, unknown>) =>
  new CliError({ code: 'GRAPHQL_ERROR', message: 'GraphQL error', details });

const UNSUPPORTED_MESSAGE =
  'Cannot query field "warnings" on type "WorkspaceMigration".';

describe('requestWithSyncWarnings', () => {
  it('asks for warnings when the server supports them', async () => {
    const request = vi.fn().mockResolvedValue('result');

    await expect(requestWithSyncWarnings(request)).resolves.toBe('result');
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith({ warnings: true });
  });

  it.each([
    [
      'a validation error code',
      {
        errors: [
          { code: 'GRAPHQL_VALIDATION_FAILED', message: UNSUPPORTED_MESSAGE },
        ],
      },
    ],
    [
      'a 400 with no code',
      { status: 400, errors: [{ code: null, message: UNSUPPORTED_MESSAGE }] },
    ],
  ])(
    'asks again without warnings when an older server answers with %s',
    async (_, details) => {
      const request = vi
        .fn()
        .mockRejectedValueOnce(buildGraphqlError(details))
        .mockResolvedValueOnce('result');

      await expect(requestWithSyncWarnings(request)).resolves.toBe('result');
      expect(request).toHaveBeenLastCalledWith({});
    },
  );

  it('does not retry on another GraphQL error', async () => {
    const error = buildGraphqlError({
      errors: [{ code: 'GRAPHQL_VALIDATION_FAILED', message: 'Other error' }],
    });
    const request = vi.fn().mockRejectedValue(error);

    await expect(requestWithSyncWarnings(request)).rejects.toBe(error);
    expect(request).toHaveBeenCalledTimes(1);
  });
});
