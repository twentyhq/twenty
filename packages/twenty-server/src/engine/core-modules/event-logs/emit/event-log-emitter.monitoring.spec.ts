import { Logger } from '@nestjs/common';
import { EventLogTable } from 'twenty-shared/types';

import { type WorkspaceEventSinkService } from '../ingest/workspace-event-sink.service';
import { EVENT_LOG_TYPES } from '../registry/event-log-registry';
import { EventLogEmitterService } from './event-log-emitter.service';

jest.mock(
  'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service',
  () => ({ WorkspaceEventSinkService: class {} }),
);
jest.mock(
  'src/engine/core-modules/event-logs/emit/build-event-envelope',
  () => ({}),
);

describe('application monitoring events', () => {
  const sink = { isEnabled: jest.fn(() => true), ingest: jest.fn() };
  const service = new EventLogEmitterService(
    sink as unknown as WorkspaceEventSinkService,
  );
  beforeEach(() => {
    jest.clearAllMocks();
    sink.ingest.mockResolvedValue(undefined);
  });

  it.each([
    ['application.install.succeeded', 'INFO'],
    ['application.install.failed', 'ERROR'],
    ['application.upgrade.succeeded', 'INFO'],
    ['application.upgrade.failed', 'ERROR'],
    ['application.uninstall.succeeded', 'INFO'],
    ['application.uninstall.failed', 'ERROR'],
    ['application.api.rate_limited', 'WARN'],
    ['application.server_route.unreachable', 'ERROR'],
  ] as const)(
    'persists %s in application logs at the correct level',
    async (event, level) => {
      await service.emitApplicationEvent({
        event,
        workspaceId: 'workspace',
        applicationRegistrationId: 'registration',
        message: 'Safe message',
        properties: { errorCode: 'CODE' },
      });
      const [envelope] = sink.ingest.mock.calls[0][0];
      expect(envelope.table).toBe('applicationLog');
      expect(envelope.row).toMatchObject({
        workspaceId: 'workspace',
        applicationId: 'registration',
        level,
        logicFunctionId: '',
        logicFunctionName: event,
        executionId: '',
      });
      const normalized = EVENT_LOG_TYPES[
        EventLogTable.APPLICATION_LOG
      ].normalize(envelope.row);
      expect(normalized.properties).toMatchObject({
        eventType: event,
        errorCode: 'CODE',
        applicationRegistrationId: 'registration',
        workspaceId: 'workspace',
      });
    },
  );

  it('does not fail the application operation when telemetry is unavailable', async () => {
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    sink.ingest.mockRejectedValue(new Error('ClickHouse unavailable'));
    await expect(
      service.emitApplicationEvent({
        event: 'application.install.failed',
        workspaceId: 'workspace',
        applicationRegistrationId: 'registration',
        message: 'Install failed.',
      }),
    ).resolves.toEqual({ success: false });
    logger.mockRestore();
  });
});
