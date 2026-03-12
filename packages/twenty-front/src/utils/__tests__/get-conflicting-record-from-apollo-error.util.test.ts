import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { type GraphQLFormattedError } from 'graphql';
import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';

const makeApolloError = (
  errors: GraphQLFormattedError[] = [],
): CombinedGraphQLErrors =>
  new CombinedGraphQLErrors({ errors, data: null });

describe('getConflictingRecordFromApolloError', () => {
  it('should return null when graphQLErrors is empty', () => {
    const error = makeApolloError([]);

    expect(getConflictingRecordFromApolloError(error)).toBeNull();
  });

  it('should return null when extensions is missing', () => {
    const error = makeApolloError([
      { message: 'error', extensions: undefined } as any,
    ]);

    expect(getConflictingRecordFromApolloError(error)).toBeNull();
  });

  it('should return null when conflictingRecordId is missing', () => {
    const error = makeApolloError([
      {
        message: 'error',
        extensions: {
          conflictingObjectNameSingular: 'person',
        },
      } as any,
    ]);

    expect(getConflictingRecordFromApolloError(error)).toBeNull();
  });

  it('should return null when conflictingObjectNameSingular is missing', () => {
    const error = makeApolloError([
      {
        message: 'error',
        extensions: {
          conflictingRecordId: 'record-123',
        },
      } as any,
    ]);

    expect(getConflictingRecordFromApolloError(error)).toBeNull();
  });

  it('should return null when conflictingRecordId is not a string', () => {
    const error = makeApolloError([
      {
        message: 'error',
        extensions: {
          conflictingRecordId: 123,
          conflictingObjectNameSingular: 'person',
        },
      } as any,
    ]);

    expect(getConflictingRecordFromApolloError(error)).toBeNull();
  });

  it('should return null when conflictingObjectNameSingular is not a string', () => {
    const error = makeApolloError([
      {
        message: 'error',
        extensions: {
          conflictingRecordId: 'record-123',
          conflictingObjectNameSingular: 456,
        },
      } as any,
    ]);

    expect(getConflictingRecordFromApolloError(error)).toBeNull();
  });

  it('should return conflicting record info when valid', () => {
    const error = makeApolloError([
      {
        message: 'error',
        extensions: {
          conflictingRecordId: 'record-123',
          conflictingObjectNameSingular: 'person',
        },
      } as any,
    ]);

    expect(getConflictingRecordFromApolloError(error)).toEqual({
      conflictingRecordId: 'record-123',
      conflictingObjectNameSingular: 'person',
    });
  });
});
