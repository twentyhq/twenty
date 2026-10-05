import { findLogicFunctionsTriggeredByEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-logic-functions-triggered-by-event-name';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';

const buildLogicFunction = ({
  id,
  triggerEventNames,
  deletedAt = null,
}: {
  id: string;
  triggerEventNames?: string[];
  deletedAt?: string | null;
}) =>
  ({
    id,
    deletedAt,
    databaseEventTriggerSettings:
      triggerEventNames?.map((eventName) => ({ eventName })) ?? null,
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
            triggerEventNames: ['person.created'],
          }),
          buildLogicFunction({
            id: 'anyObject',
            triggerEventNames: ['*.created'],
          }),
          buildLogicFunction({
            id: 'anyOperation',
            triggerEventNames: ['person.*'],
          }),
          buildLogicFunction({ id: 'everything', triggerEventNames: ['*.*'] }),
          buildLogicFunction({
            id: 'otherObject',
            triggerEventNames: ['company.created'],
          }),
        ],
        'person.created',
      ),
    ).toEqual(['exact', 'anyObject', 'anyOperation', 'everything']);
  });

  it('matches a logic function once when any of its triggers listens on the event', () => {
    expect(
      findTriggeredLogicFunctionIds(
        [
          buildLogicFunction({
            id: 'createdOrUpdated',
            triggerEventNames: ['person.created', 'person.updated'],
          }),
          buildLogicFunction({
            id: 'twiceMatching',
            triggerEventNames: ['person.updated', '*.updated'],
          }),
          buildLogicFunction({
            id: 'otherEvents',
            triggerEventNames: ['person.deleted', 'company.updated'],
          }),
        ],
        'person.updated',
      ),
    ).toEqual(['createdOrUpdated', 'twiceMatching']);
  });

  it('ignores deleted logic functions and those without a database event trigger', () => {
    expect(
      findTriggeredLogicFunctionIds(
        [
          buildLogicFunction({
            id: 'deleted',
            triggerEventNames: ['person.created'],
            deletedAt: '2026-09-01T00:00:00.000Z',
          }),
          buildLogicFunction({ id: 'httpRoute' }),
          buildLogicFunction({ id: 'emptyTriggerList', triggerEventNames: [] }),
        ],
        'person.created',
      ),
    ).toEqual([]);
  });
});
