import * as Sentry from '@sentry/node';

import { ExceptionHandlerSentryDriver } from 'src/engine/core-modules/exception-handler/drivers/sentry.driver';

const setExtraMock = jest.fn();
const setTagMock = jest.fn();
const setUserMock = jest.fn();
const setContextMock = jest.fn();
const setFingerprintMock = jest.fn();
const addBreadcrumbMock = jest.fn();
const captureExceptionMock = jest.fn(() => 'event-id');

jest.mock('@sentry/node', () => ({
  withScope: (callback: (scope: unknown) => void) => {
    callback({
      setExtra: setExtraMock,
      setTag: setTagMock,
      setUser: setUserMock,
      setContext: setContextMock,
      setFingerprint: setFingerprintMock,
      addBreadcrumb: addBreadcrumbMock,
    });
  },
  captureException: (...args: unknown[]) => captureExceptionMock(...args),
}));

describe('ExceptionHandlerSentryDriver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add workspace tags when workspace details are available', () => {
    const driver = new ExceptionHandlerSentryDriver();

    driver.captureExceptions([new Error('boom')], {
      workspace: {
        id: 'workspace-id',
        activationStatus: 'ACTIVE',
        version: '2.8',
        metadataVersion: 42,
      },
    });

    expect(setTagMock).toHaveBeenCalledWith('workspaceId', 'workspace-id');
    expect(setTagMock).toHaveBeenCalledWith(
      'workspaceActivationStatus',
      'ACTIVE',
    );
    expect(setTagMock).toHaveBeenCalledWith('workspaceVersion', '2.8');
    expect(setTagMock).toHaveBeenCalledWith('workspaceMetadataVersion', '42');
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  });

  it('should not add workspace tags when workspace details are missing', () => {
    const driver = new ExceptionHandlerSentryDriver();

    driver.captureExceptions([new Error('boom')]);

    expect(setTagMock).not.toHaveBeenCalledWith(
      'workspaceMetadataVersion',
      expect.anything(),
    );
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  });
});
