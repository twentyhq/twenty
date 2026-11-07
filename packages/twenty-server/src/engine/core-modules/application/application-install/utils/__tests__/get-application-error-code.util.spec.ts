import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { getApplicationErrorCode } from 'src/engine/core-modules/application/application-install/utils/get-application-error-code.util';

describe('getApplicationErrorCode', () => {
  it('returns the code of an application exception', () => {
    expect(
      getApplicationErrorCode(
        new ApplicationException(
          'Package not found',
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        ),
      ),
    ).toBe(ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED);
  });

  it('returns UNKNOWN for any other error', () => {
    expect(getApplicationErrorCode(new Error('boom'))).toBe('UNKNOWN');
  });
});
