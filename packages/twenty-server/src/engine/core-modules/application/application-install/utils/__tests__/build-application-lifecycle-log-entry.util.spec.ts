import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { buildApplicationLifecycleLogEntry } from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-log-entry.util';

const CONTEXT = {
  workspaceId: 'workspace-1',
  applicationId: 'application-1',
  applicationRegistrationId: 'registration-1',
};

describe('buildApplicationLifecycleLogEntry', () => {
  it('records a successful install as an info row', () => {
    expect(
      buildApplicationLifecycleLogEntry({
        ...CONTEXT,
        source: 'INSTALL',
        version: '1.2.3',
      }),
    ).toMatchObject({
      ...CONTEXT,
      applicationVersion: '1.2.3',
      source: 'INSTALL',
      logicFunctionId: '',
      logicFunctionName: '',
      executionId: '',
      level: 'INFO',
      message: 'Installed version 1.2.3.',
      errorCode: '',
      properties: {},
    });
  });

  it('records a failed upgrade with the application exception code', () => {
    expect(
      buildApplicationLifecycleLogEntry({
        ...CONTEXT,
        source: 'UPGRADE',
        version: '1.2.3',
        previousVersion: '1.2.2',
        error: new ApplicationException(
          'Migration failed',
          ApplicationExceptionCode.UPGRADE_FAILED,
        ),
      }),
    ).toMatchObject({
      level: 'ERROR',
      message: 'Upgrade from 1.2.2 to 1.2.3 failed: Migration failed',
      errorCode: ApplicationExceptionCode.UPGRADE_FAILED,
      properties: { previousVersion: '1.2.2' },
    });
  });

  it('omits the target version of an upgrade whose package did not resolve', () => {
    expect(
      buildApplicationLifecycleLogEntry({
        ...CONTEXT,
        source: 'UPGRADE',
        version: '',
        previousVersion: '1.2.2',
        error: new ApplicationException(
          'Registry returned 404 for acme-sync@latest',
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        ),
      }),
    ).toMatchObject({
      message:
        'Upgrade from 1.2.2 failed: Registry returned 404 for acme-sync@latest',
      errorCode: ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
    });
  });

  it('records an unexpected uninstall error as UNKNOWN', () => {
    expect(
      buildApplicationLifecycleLogEntry({
        ...CONTEXT,
        source: 'UNINSTALL',
        version: '1.2.3',
        error: new Error('Connection lost'),
      }),
    ).toMatchObject({
      level: 'ERROR',
      message: 'Uninstall failed: Connection lost',
      errorCode: 'UNKNOWN',
    });
  });

  it('records a successful uninstall', () => {
    expect(
      buildApplicationLifecycleLogEntry({
        ...CONTEXT,
        source: 'UNINSTALL',
        version: '1.2.3',
      }),
    ).toMatchObject({ level: 'INFO', message: 'Uninstalled.' });
  });
});
