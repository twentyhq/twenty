import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';

describe('transformEventToWebhookEvent', () => {
  it('should transform event to webhook event', () => {
    const record = {
      recordId: 'recordId',
      properties: {
        after: {
          id: 'id',
          nameSingular: 'nameSingular',
          secret: 'secret',
        },
        updatedFields: ['nameSingular'],
      },
    } as ObjectRecordEvent;

    const expectedResult = {
      record: {
        id: 'id',
        nameSingular: 'nameSingular',
        secret: 'secret',
      },
      updatedFields: ['nameSingular'],
    };

    expect(
      transformEventToWebhookEvent({
        eventName: 'nameSingular.created',
        event: record,
      }),
    ).toEqual(expectedResult);
  });
});
