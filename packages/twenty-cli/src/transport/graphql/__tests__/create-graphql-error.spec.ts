import { describe, expect, it } from 'vitest';

import { createGraphqlError } from '@/transport/graphql/create-graphql-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

const target: ResolvedTarget = {
  apiUrl: 'https://app.twenty.com',
  bearerToken: 'test-token',
  credentialKind: 'apiKey',
  source: 'environment',
};

const createError = (errors: unknown[], status = 200) =>
  createGraphqlError({
    errors,
    data: null,
    status,
    headers: new Headers(),
    target,
  });

describe('createGraphqlError', () => {
  it('surfaces metadata validation detail and the generic summary', () => {
    const error = createError([
      {
        message: 'Workspace migration builder failed',
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          message: 'Validation failed for 1 field',
          errors: {
            fieldMetadata: [
              {
                metadataName: 'fieldMetadata',
                errors: [
                  {
                    code: 'INVALID_NAME',
                    message: 'Field name "123" is invalid',
                  },
                ],
                flatEntityMinimalInformation: { nameSingular: 'invalidField' },
              },
            ],
          },
        },
      },
    ]);

    expect(error.code).toBe('GRAPHQL_ERROR');
    expect(error.message).toBe('Validation failed for 1 field');
    expect(error.details?.validationErrors).toEqual([
      {
        metadataName: 'fieldMetadata',
        entityLabel: 'invalidField',
        message: 'Field name "123" is invalid',
      },
    ]);
  });

  it('keeps the first message and omits validationErrors for a plain error', () => {
    const error = createError([{ message: 'Something broke' }]);

    expect(error.message).toBe('Something broke');
    expect(error.details?.validationErrors).toBeUndefined();
  });
});
