import { describe, expect, it } from 'vitest';

import { isPermissionDeniedError } from 'src/front-components/utils/is-permission-denied-error.util';

// Mirrors the GenqlError thrown by CoreApiClient for a GraphQL error payload.
const buildGraphqlClientError = (errors: unknown[]) =>
  Object.assign(new Error('GraphQL error'), { errors, data: null });

describe('isPermissionDeniedError', () => {
  it('detects a permission denied error from the workspace API', () => {
    expect(
      isPermissionDeniedError(
        buildGraphqlClientError([
          {
            message: 'Permission denied',
            extensions: {
              code: 'FORBIDDEN',
              subCode: 'PERMISSION_DENIED',
              userFriendlyMessage: 'User does not have permission.',
            },
          },
        ]),
      ),
    ).toBe(true);
  });

  it('ignores other GraphQL errors', () => {
    expect(
      isPermissionDeniedError(
        buildGraphqlClientError([
          { message: 'Bad input', extensions: { code: 'BAD_USER_INPUT' } },
          { message: 'No extensions' },
        ]),
      ),
    ).toBe(false);
  });

  it.each([
    new Error('Network failure'),
    new Error('Empty GraphQL response'),
    'FORBIDDEN',
    null,
    undefined,
  ])('ignores errors without a GraphQL payload (%j)', (error) => {
    expect(isPermissionDeniedError(error)).toBe(false);
  });
});
