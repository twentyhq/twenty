import { formatError } from '~/pages/settings/data-model/utils/format-error.utils';

describe('formatError', () => {
  it('should return the error message', () => {
    const errorMessage = 'This is an error message';
    expect(formatError(errorMessage)).toEqual(errorMessage);
  });

  it('should format the error message when the error message is a duplicate field name', () => {
    const errorMessage =
      'duplicate key value violates unique constraint "IndexOnNameObjectMetadataIdAndWorkspaceIdUnique"';
    expect(formatError(errorMessage)).toEqual(
      'Please use different names for your source and destination fields',
    );
  });
});
