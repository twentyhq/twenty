import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { buildServerRouteFailureLogEntry } from 'src/engine/core-modules/server-route-trigger/utils/build-server-route-failure-log-entry.util';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

const resolver = {
  id: 'resolver-1',
  name: 'routeInboundMessage',
  workspaceId: 'owner-workspace',
  applicationId: 'application-1',
  application: { version: '1.2.3' },
};

describe('buildServerRouteFailureLogEntry', () => {
  it('records the failure against the resolver in the owner workspace', () => {
    expect(
      buildServerRouteFailureLogEntry({
        resolver,
        applicationRegistrationId: 'registration-1',
        error: new ServerRouteTriggerException(
          'Resolver logic function returned an invalid result.',
          ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
        ),
      }),
    ).toMatchObject({
      workspaceId: 'owner-workspace',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'SERVER_ROUTE',
      logicFunctionId: 'resolver-1',
      logicFunctionName: 'routeInboundMessage',
      level: 'ERROR',
      message:
        'Server route request failed: Resolver logic function returned an invalid result.',
      errorCode: ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    });
  });

  it('keeps the code of a usage refusal', () => {
    expect(
      buildServerRouteFailureLogEntry({
        resolver,
        applicationRegistrationId: 'registration-1',
        error: new UsageLimitException(
          'Quota exhausted',
          UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        ),
      }),
    ).toMatchObject({
      message: 'Server route request failed: Quota exhausted',
      errorCode: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
    });
  });

  it('keeps the detail of a platform error out of the app log', () => {
    expect(
      buildServerRouteFailureLogEntry({
        resolver,
        applicationRegistrationId: 'registration-1',
        error: new Error('connect ECONNREFUSED 10.0.0.12:6379'),
      }),
    ).toMatchObject({
      message: 'Server route request failed because of a platform error.',
      errorCode: ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
    });
  });
});
