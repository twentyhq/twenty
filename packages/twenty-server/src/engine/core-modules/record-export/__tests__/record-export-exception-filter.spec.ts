import { msg } from '@lingui/core/macro';

import {
  ErrorCode,
  InternalServerError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RecordExportExceptionFilter } from 'src/engine/core-modules/record-export/record-export-exception-filter';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';

describe('RecordExportExceptionFilter', () => {
  const filter = new RecordExportExceptionFilter();

  it('preserves validation errors and their translated message', () => {
    const userFriendlyMessage = msg`An export field is no longer available.`;
    const exception = new RecordExportException(
      'Missing morph target',
      'MORPH_TARGET_NOT_FOUND',
      { userFriendlyMessage },
    );

    expect(() => filter.catch(exception)).toThrow(
      expect.objectContaining({
        name: 'ValidationError',
        extensions: {
          code: ErrorCode.GRAPHQL_VALIDATION_FAILED,
          subCode: 'MORPH_TARGET_NOT_FOUND',
          userFriendlyMessage,
        },
      }),
    );
  });

  it('keeps export infrastructure failures as server errors', () => {
    const exception = new RecordExportException(
      'Export queue is unavailable',
      'QUEUE_UNAVAILABLE',
    );

    expect(() => filter.catch(exception)).toThrow(InternalServerError);
  });
});
