import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { buildServerRouteFailureLogEntry } from 'src/engine/core-modules/server-route-trigger/utils/build-server-route-failure-log-entry.util';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const resolver = {
  id: 'resolver-1',
  name: 'routeInboundMessage',
  workspaceId: 'owner-workspace',
  applicationId: 'application-1',
  application: { version: '1.2.3' },
} as LogicFunctionEntity;

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

  it('records an unexpected error as UNKNOWN', () => {
    expect(
      buildServerRouteFailureLogEntry({
        resolver,
        applicationRegistrationId: 'registration-1',
        error: new Error('Queue unavailable'),
      }),
    ).toMatchObject({
      message: 'Server route request failed: Queue unavailable',
      errorCode: 'UNKNOWN',
    });
  });
});
