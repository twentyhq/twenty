import { findLogicFunctionsTriggeredByAppEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/app-event/utils/find-logic-functions-triggered-by-app-event.util';

const APPLICATION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const EVENT_UNIVERSAL_IDENTIFIER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const buildLogicFunction = ({
  id,
  applicationId = APPLICATION_ID,
  eventUniversalIdentifier = EVENT_UNIVERSAL_IDENTIFIER,
  deletedAt = null,
}: {
  id: string;
  applicationId?: string;
  eventUniversalIdentifier?: string | null;
  deletedAt?: string | null;
}) => ({
  id,
  applicationId,
  deletedAt,
  appEventTriggerSettings:
    eventUniversalIdentifier === null ? null : { eventUniversalIdentifier },
});

describe('findLogicFunctionsTriggeredByAppEvent', () => {
  it('should find only the live functions of the emitting app listening to that event', () => {
    const logicFunctions = [
      buildLogicFunction({ id: 'listening' }),
      buildLogicFunction({
        id: 'other-app',
        applicationId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      }),
      buildLogicFunction({
        id: 'other-event',
        eventUniversalIdentifier: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      }),
      buildLogicFunction({ id: 'no-trigger', eventUniversalIdentifier: null }),
      buildLogicFunction({
        id: 'deleted',
        deletedAt: '2026-11-27T00:00:00.000Z',
      }),
    ];

    expect(
      findLogicFunctionsTriggeredByAppEvent({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: Object.fromEntries(
            logicFunctions.map((logicFunction) => [
              logicFunction.id,
              logicFunction,
            ]),
          ),
        },
        applicationId: APPLICATION_ID,
        eventUniversalIdentifier: EVENT_UNIVERSAL_IDENTIFIER,
      }).map(({ id }) => id),
    ).toEqual(['listening']);
  });
});
