import { describe, expect, it } from 'vitest';

import { extractMetadataValidation } from '@/transport/graphql/extract-metadata-validation';

const metadataValidationError = {
  message: 'Workspace migration builder failed',
  extensions: {
    code: 'METADATA_VALIDATION_FAILED',
    message: 'Validation failed for 2 fields',
    summary: { totalErrors: 2, fieldMetadata: 2 },
    errors: {
      fieldMetadata: [
        {
          type: 'create_field',
          metadataName: 'fieldMetadata',
          errors: [
            { code: 'INVALID_NAME', message: 'Field name "123" is invalid' },
          ],
          flatEntityMinimalInformation: {
            name: '123',
            nameSingular: 'invalidField',
          },
        },
        {
          type: 'create_field',
          metadataName: 'fieldMetadata',
          errors: [
            {
              code: 'DUPLICATE',
              message: 'A field with this name already exists',
            },
          ],
          flatEntityMinimalInformation: { name: 'status' },
        },
      ],
    },
  },
};

describe('extractMetadataValidation', () => {
  it('flattens the per-entity breakdown and keeps the generic summary', () => {
    expect(extractMetadataValidation([metadataValidationError])).toEqual({
      summary: 'Validation failed for 2 fields',
      errors: [
        {
          metadataName: 'fieldMetadata',
          entityLabel: 'invalidField',
          message: 'Field name "123" is invalid',
        },
        {
          metadataName: 'fieldMetadata',
          entityLabel: 'status',
          message: 'A field with this name already exists',
        },
      ],
    });
  });

  it('returns no errors for a plain GraphQL error', () => {
    expect(
      extractMetadataValidation([
        { message: 'Boom', extensions: { code: 'GRAPHQL_ERROR' } },
      ]),
    ).toEqual({ errors: [] });
  });

  it('ignores malformed entries without throwing', () => {
    expect(
      extractMetadataValidation([
        null,
        'nope',
        {
          extensions: {
            code: 'METADATA_VALIDATION_FAILED',
            errors: { fieldMetadata: 'not-an-array' },
          },
        },
        {
          extensions: {
            code: 'METADATA_VALIDATION_FAILED',
            errors: {
              fieldMetadata: [
                {
                  errors: [{ message: 42 }],
                  flatEntityMinimalInformation: { name: 'status' },
                },
              ],
            },
          },
        },
      ]),
    ).toEqual({ errors: [] });
  });

  it('ignores a breakdown without the validation-failed code', () => {
    expect(
      extractMetadataValidation([
        {
          extensions: {
            code: 'GRAPHQL_ERROR',
            message: 'Something else',
            errors: {
              fieldMetadata: [
                {
                  errors: [{ code: 'INVALID_NAME', message: 'nope' }],
                  flatEntityMinimalInformation: { name: 'status' },
                },
              ],
            },
          },
        },
      ]),
    ).toEqual({ errors: [] });
  });

  it('caps the breakdown at 100 entries', () => {
    const failures = Array.from({ length: 60 }, (_, index) => ({
      metadataName: 'fieldMetadata',
      errors: [{ code: 'INVALID', message: `error ${index}` }],
      flatEntityMinimalInformation: { name: `field-${index}` },
    }));

    const { errors } = extractMetadataValidation([
      {
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          errors: { fieldMetadata: failures, objectMetadata: failures },
        },
      },
    ]);

    expect(errors).toHaveLength(100);
  });
});
