import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const buildException = (
  report: Record<string, unknown[]>,
): WorkspaceMigrationBuilderException => {
  return new WorkspaceMigrationBuilderException({
    status: 'fail' as const,
    report: report as never,
  });
};

describe('formatValidationErrors', () => {
  it('should format a single error with its identifier', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'INVALID_NAME', message: 'Name must be camelCase' }],
          flatEntityMinimalInformation: { name: 'bad_field' },
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[fieldMetadata] Name must be camelCase (bad_field)',
    );
  });

  it('should group repeated errors and list all identifiers', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'INVALID_NAME', message: 'Name must be camelCase' }],
          flatEntityMinimalInformation: { name: 'interno' },
        },
        {
          errors: [{ code: 'INVALID_NAME', message: 'Name must be camelCase' }],
          flatEntityMinimalInformation: { name: 'retailer_name' },
        },
        {
          errors: [{ code: 'INVALID_NAME', message: 'Name must be camelCase' }],
          flatEntityMinimalInformation: { name: 'order_date' },
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[fieldMetadata] Name must be camelCase (interno, retailer_name, order_date)',
    );
  });

  it('should handle multiple different errors across entities', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [
            { code: 'INVALID_NAME', message: 'Name must be camelCase' },
            { code: 'MISSING_TYPE', message: 'Type is required' },
          ],
          flatEntityMinimalInformation: { name: 'bad_field' },
        },
        {
          errors: [{ code: 'INVALID_NAME', message: 'Name must be camelCase' }],
          flatEntityMinimalInformation: { name: 'another_bad' },
        },
      ],
    });

    const result = formatValidationErrors(error);

    expect(result).toContain(
      '[fieldMetadata] Name must be camelCase (bad_field, another_bad)',
    );
    expect(result).toContain('[fieldMetadata] Type is required (bad_field)');
  });

  it('should fall back to code when message is missing', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'SNAKE_CASE_REQUIRED', message: '' }],
          flatEntityMinimalInformation: { name: 'test_field' },
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[fieldMetadata] SNAKE_CASE_REQUIRED (test_field)',
    );
  });

  it('should use nameSingular as identifier for object metadata', () => {
    const error = buildException({
      objectMetadata: [
        {
          errors: [{ code: 'DUPLICATE', message: 'Object already exists' }],
          flatEntityMinimalInformation: { nameSingular: 'invoice' },
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[objectMetadata] Object already exists (invoice)',
    );
  });

  it('should use label as fallback identifier', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'ERR', message: 'Something wrong' }],
          flatEntityMinimalInformation: { label: 'My Field' },
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[fieldMetadata] Something wrong (My Field)',
    );
  });

  it('should handle failures without identifiers', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'ERR', message: 'Unknown error' }],
          flatEntityMinimalInformation: {},
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[fieldMetadata] Unknown error',
    );
  });

  it('should handle failures without flatEntityMinimalInformation', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'ERR', message: 'No info' }],
        },
      ],
    });

    expect(formatValidationErrors(error)).toBe(
      'Validation errors:\n[fieldMetadata] No info',
    );
  });

  it('should return error.message when report has no failures', () => {
    const error = buildException({
      fieldMetadata: [],
      objectMetadata: [],
    });

    expect(formatValidationErrors(error)).toBe(
      'Workspace migration builder failed',
    );
  });

  it('should handle multiple entity types', () => {
    const error = buildException({
      fieldMetadata: [
        {
          errors: [{ code: 'ERR', message: 'Field error' }],
          flatEntityMinimalInformation: { name: 'myField' },
        },
      ],
      objectMetadata: [
        {
          errors: [{ code: 'ERR', message: 'Object error' }],
          flatEntityMinimalInformation: { nameSingular: 'myObject' },
        },
      ],
    });

    const result = formatValidationErrors(error);

    expect(result).toContain('[fieldMetadata] Field error (myField)');
    expect(result).toContain('[objectMetadata] Object error (myObject)');
  });

  it('should skip entries with no errors array', () => {
    const error = buildException({
      fieldMetadata: [{ flatEntityMinimalInformation: { name: 'test' } }],
    });

    expect(formatValidationErrors(error)).toBe(
      'Workspace migration builder failed',
    );
  });

  it('should handle large batch with identical errors efficiently', () => {
    const failures = Array.from({ length: 10 }, (_, i) => ({
      errors: [{ code: 'INVALID', message: 'Name must be camelCase' }],
      flatEntityMinimalInformation: { name: `field_${i}` },
    }));

    const error = buildException({ fieldMetadata: failures });
    const result = formatValidationErrors(error);
    const lines = result.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('field_0');
    expect(lines[1]).toContain('field_9');
  });
});
