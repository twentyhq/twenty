import * as Sentry from '@sentry/node';

import { monitorEmailRendering } from 'src/engine/core-modules/email/utils/monitor-email-rendering.util';

const mockSetExtra = jest.fn();
const mockSetFingerprint = jest.fn();
const mockSetLevel = jest.fn();
const mockSetTag = jest.fn();

type MockSentryScope = {
  setExtra: typeof mockSetExtra;
  setFingerprint: typeof mockSetFingerprint;
  setLevel: typeof mockSetLevel;
  setTag: typeof mockSetTag;
};

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  withScope: jest.fn((callback: (scope: MockSentryScope) => void) =>
    callback({
      setExtra: mockSetExtra,
      setFingerprint: mockSetFingerprint,
      setLevel: mockSetLevel,
      setTag: mockSetTag,
    }),
  ),
}));

describe('monitorEmailRendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should capture invalid email HTML with template and locale metadata', () => {
    monitorEmailRendering({
      templateType: 'email-verification',
      locale: 'en-US',
      html: '<!--$!--><template></template><!--/$-->',
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'EmailRenderError',
        message: 'Email template rendered an invalid HTML body',
      }),
    );
    expect(mockSetTag).toHaveBeenCalledWith(
      'emailTemplate',
      'email-verification',
    );
    expect(mockSetTag).toHaveBeenCalledWith('emailLocale', 'en-US');
    expect(mockSetTag).toHaveBeenCalledWith(
      'emailRenderStatus',
      'errored_suspense_boundary',
    );
  });

  it('should not capture valid email HTML', () => {
    monitorEmailRendering({
      templateType: 'email-verification',
      locale: 'en-US',
      html: '<html><body>Verify your email</body></html>',
    });

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.withScope).not.toHaveBeenCalled();
  });

  it('should capture an empty email body', () => {
    monitorEmailRendering({
      templateType: 'email-verification',
      locale: 'en-US',
      html: '  ',
    });

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(mockSetTag).toHaveBeenCalledWith('emailRenderStatus', 'empty');
  });
});
