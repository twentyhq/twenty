import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileMeetingBotCalendarChannelEventAssociationHandler } from 'src/logic-functions/reconcile-meeting-bot-calendar-channel-event-association';

const reconcileMeetingBotForCalendarEventIdsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/flows/reconcile-meeting-bot.util', () => ({
  reconcileMeetingBotForCalendarEventIds:
    reconcileMeetingBotForCalendarEventIdsMock,
}));

type AssociationEvent = Parameters<
  typeof reconcileMeetingBotCalendarChannelEventAssociationHandler
>[0];

const buildAssociationEvent = ({
  action,
  updatedFields,
  beforeCalendarEventId = 'calendar-event-before',
  afterCalendarEventId = 'calendar-event-after',
}: {
  action: string;
  updatedFields?: string[];
  beforeCalendarEventId?: string | null;
  afterCalendarEventId?: string | null;
}): AssociationEvent =>
  ({
    name: `calendarChannelEventAssociation.${action}`,
    recordId: 'association-1',
    properties: {
      updatedFields,
      before: { id: 'association-1', calendarEventId: beforeCalendarEventId },
      after: { id: 'association-1', calendarEventId: afterCalendarEventId },
    },
  }) as unknown as AssociationEvent;

describe('reconcileMeetingBotCalendarChannelEventAssociationHandler', () => {
  beforeEach(() => {
    reconcileMeetingBotForCalendarEventIdsMock.mockReset();
    reconcileMeetingBotForCalendarEventIdsMock.mockResolvedValue([
      { action: 'CREATED' },
    ]);
  });

  it('reconciles the synced calendar event when an association is created', async () => {
    const result =
      await reconcileMeetingBotCalendarChannelEventAssociationHandler(
        buildAssociationEvent({ action: 'created' }),
      );

    expect(reconcileMeetingBotForCalendarEventIdsMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-after'] }),
    );
    expect(result).toMatchObject({
      reconciled: true,
      calendarEventIds: ['calendar-event-after'],
    });
  });

  it('reconciles both calendar events when a relevant field changes', async () => {
    const result =
      await reconcileMeetingBotCalendarChannelEventAssociationHandler(
        buildAssociationEvent({
          action: 'updated',
          updatedFields: ['calendarEventId'],
        }),
      );

    expect(reconcileMeetingBotForCalendarEventIdsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEventIds: ['calendar-event-after', 'calendar-event-before'],
      }),
    );
    expect(result).toMatchObject({ reconciled: true });
  });

  it('skips updates that do not touch relevant fields', async () => {
    const result =
      await reconcileMeetingBotCalendarChannelEventAssociationHandler(
        buildAssociationEvent({
          action: 'updated',
          updatedFields: ['eventExternalId'],
        }),
      );

    expect(reconcileMeetingBotForCalendarEventIdsMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('reconciles the previously synced calendar event when an association is deleted', async () => {
    const result =
      await reconcileMeetingBotCalendarChannelEventAssociationHandler(
        buildAssociationEvent({ action: 'deleted' }),
      );

    expect(reconcileMeetingBotForCalendarEventIdsMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-before'] }),
    );
    expect(result).toMatchObject({ reconciled: true });
  });

  it('skips events for other objects', async () => {
    const result =
      await reconcileMeetingBotCalendarChannelEventAssociationHandler({
        name: 'calendarEvent.created',
        recordId: 'calendar-event-1',
        properties: {},
      } as unknown as AssociationEvent);

    expect(reconcileMeetingBotForCalendarEventIdsMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('skips created associations without a calendar event id', async () => {
    const result =
      await reconcileMeetingBotCalendarChannelEventAssociationHandler(
        buildAssociationEvent({
          action: 'created',
          afterCalendarEventId: null,
        }),
      );

    expect(reconcileMeetingBotForCalendarEventIdsMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });
});
