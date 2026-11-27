import { SERVER_ROUTE_APPLICATION_NOT_INSTALLED_REASON } from 'src/engine/core-modules/server-route-trigger/constants/server-route-application-not-installed-reason.constant';
import { buildServerRouteSkippedDispatchLogEntry } from 'src/engine/core-modules/server-route-trigger/utils/build-server-route-skipped-dispatch-log-entry.util';

describe('buildServerRouteSkippedDispatchLogEntry', () => {
  it('records the skip as a warning against the resolver in the owner workspace', () => {
    expect(
      buildServerRouteSkippedDispatchLogEntry({
        resolver: {
          id: 'resolver-1',
          name: 'routeInboundMessage',
          workspaceId: 'owner-workspace',
          applicationId: 'application-1',
          application: { version: '1.2.3' },
        },
        applicationRegistrationId: 'registration-1',
      }),
    ).toMatchObject({
      workspaceId: 'owner-workspace',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'SERVER_ROUTE',
      logicFunctionId: 'resolver-1',
      logicFunctionName: 'routeInboundMessage',
      level: 'WARN',
      errorCode: SERVER_ROUTE_APPLICATION_NOT_INSTALLED_REASON,
    });
  });
});
