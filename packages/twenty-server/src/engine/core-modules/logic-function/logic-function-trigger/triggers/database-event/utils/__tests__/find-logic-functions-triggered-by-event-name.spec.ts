import { findLogicFunctionsTriggeredByEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-logic-functions-triggered-by-event-name';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';

const buildLogicFunction = ({
  id,
  triggerEventName,
  deletedAt = null,
}: {
  id: string;
  triggerEventName?: string;
  deletedAt?: string | null;
}) =>
  ({
    id,
    deletedAt,
    databaseEventTriggerSettings: triggerEventName
      ? { eventName: triggerEventName }
      : null,
  }) as unknown as FlatLogicFunction;

const findTriggeredLogicFunctionIds = (
  logicFunctions: FlatLogicFunction[],
  eventName: string,
) => {
  const flatLogicFunctionMaps: FlatLogicFunctionMaps = {
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
    byUniversalIdentifier: Object.fromEntries(
      logicFunctions.map((logicFunction) => [logicFunction.id, logicFunction]),
    ),
  };

  return findLogicFunctionsTriggeredByEventName({
    flatLogicFunctionMaps,
    eventName,
  }).map((logicFunction) => logicFunction.id);
};

describe('findLogicFunctionsTriggeredByEventName', () => {
  it('matches exact and wildcard trigger event names', () => {
    expect(
      findTriggeredLogicFunctionIds(
        [
          buildLogicFunction({
            id: 'exact',
            triggerEventName: 'person.created',
          }),
          buildLogicFunction({
            id: 'anyObject',
            triggerEventName: '*.created',
          }),
          buildLogicFunction({
            id: 'anyOperation',
            triggerEventName: 'person.*',
          }),
          buildLogicFunction({ id: 'everything', triggerEventName: '*.*' }),
          buildLogicFunction({
            id: 'otherObject',
            triggerEventName: 'company.created',
          }),
        ],
        'person.created',
      ),
    ).toEqual(['exact', 'anyObject', 'anyOperation', 'everything']);
  });

  it('ignores deleted logic functions and those without a database event trigger', () => {
    expect(
      findTriggeredLogicFunctionIds(
        [
          buildLogicFunction({
            id: 'deleted',
            triggerEventName: 'person.created',
            deletedAt: '2026-09-01T00:00:00.000Z',
          }),
          buildLogicFunction({ id: 'httpRoute' }),
        ],
        'person.created',
      ),
    ).toEqual([]);
  });
});
