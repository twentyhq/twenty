import { getAwsSesDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/get-aws-ses-driver-exception-code.util';
import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

describe('getAwsSesDriverExceptionCode', () => {
  it('should classify a send-rate breach as temporary even though SES answers it with a 4xx status', () => {
    expect(
      getAwsSesDriverExceptionCode({
        name: 'TooManyRequestsException',
        message: 'Maximum sending rate exceeded.',
        $metadata: { httpStatusCode: 400 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should classify a 24-hour quota breach as temporary', () => {
    expect(
      getAwsSesDriverExceptionCode({
        name: 'LimitExceededException',
        message: 'Daily message quota exceeded.',
        $metadata: { httpStatusCode: 400 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should classify a throttling status without a recognized name as temporary', () => {
    expect(
      getAwsSesDriverExceptionCode({
        name: 'SomeUnmappedError',
        $metadata: { httpStatusCode: 429 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should classify a server error as temporary', () => {
    expect(
      getAwsSesDriverExceptionCode({
        name: 'SomeUnmappedError',
        $metadata: { httpStatusCode: 503 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.TEMPORARY_ERROR);
  });

  it('should classify a denied or suspended account as insufficient permissions', () => {
    expect(
      getAwsSesDriverExceptionCode({
        name: 'AccountSuspendedException',
        $metadata: { httpStatusCode: 400 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS);

    expect(
      getAwsSesDriverExceptionCode({
        name: 'SomeUnmappedError',
        $metadata: { httpStatusCode: 403 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS);
  });

  it('should classify a rejected message as a configuration error', () => {
    expect(
      getAwsSesDriverExceptionCode({
        name: 'MessageRejected',
        $metadata: { httpStatusCode: 400 },
      }),
    ).toBe(EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR);
  });

  it('should classify an error carrying neither a known name nor a status as unknown', () => {
    expect(getAwsSesDriverExceptionCode({})).toBe(
      EmailingDomainDriverExceptionCode.UNKNOWN,
    );
  });
});
