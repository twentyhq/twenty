import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { GraphQLError } from 'graphql';

import { getApplicationLookupStatus } from '~/pages/settings/applications/utils/getApplicationLookupStatus';

const baseArgs = {
  identifier: 'f2b1c3d4-0000-4000-8000-000000000000',
  isLoading: false,
  error: undefined,
  result: undefined,
};

const buildGraphqlError = (code: string) =>
  new CombinedGraphQLErrors({
    errors: [new GraphQLError('error', { extensions: { code } })],
  });

const buildServerError = (statusCode: number) =>
  new ServerError('server error', {
    response: { status: statusCode } as Response,
    bodyText: '',
  });

describe('getApplicationLookupStatus', () => {
  it('is not found without an identifier', () => {
    expect(getApplicationLookupStatus({ ...baseArgs, identifier: '' })).toBe(
      'not-found',
    );
  });

  it('is not found for a malformed identifier, whatever the query returns', () => {
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        identifier: 'not-a-uuid',
        isLoading: true,
      }),
    ).toBe('not-found');
  });

  it('accepts a UUID v7 identifier', () => {
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        identifier: '0198fe12-3456-7000-8000-000000000000',
        result: { id: 'app' },
      }),
    ).toBe('found');
  });

  it('is loading while the query runs', () => {
    expect(getApplicationLookupStatus({ ...baseArgs, isLoading: true })).toBe(
      'loading',
    );
  });

  it('is found once the query returns a result', () => {
    expect(
      getApplicationLookupStatus({ ...baseArgs, result: { id: 'app' } }),
    ).toBe('found');
  });

  it('stays found when a refetch fails after data was loaded', () => {
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        result: { id: 'app' },
        error: buildServerError(503),
      }),
    ).toBe('found');
  });

  it('is not found when the query completes without a result', () => {
    expect(getApplicationLookupStatus(baseArgs)).toBe('not-found');
  });

  it('is unavailable on a GraphQL error that is not a not-found', () => {
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        error: buildGraphqlError('INTERNAL_SERVER_ERROR'),
      }),
    ).toBe('unavailable');
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        error: buildGraphqlError('FORBIDDEN'),
      }),
    ).toBe('unavailable');
  });

  it('is not found on a GraphQL not-found error', () => {
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        error: buildGraphqlError('NOT_FOUND'),
      }),
    ).toBe('not-found');
  });

  it('is unavailable when the server rejects the request', () => {
    expect(
      getApplicationLookupStatus({ ...baseArgs, error: buildServerError(400) }),
    ).toBe('unavailable');
  });

  it('is unavailable on a server failure', () => {
    expect(
      getApplicationLookupStatus({ ...baseArgs, error: buildServerError(503) }),
    ).toBe('unavailable');
  });

  it('is unavailable on a network failure', () => {
    expect(
      getApplicationLookupStatus({
        ...baseArgs,
        error: new TypeError('Failed to fetch'),
      }),
    ).toBe('unavailable');
  });
});
