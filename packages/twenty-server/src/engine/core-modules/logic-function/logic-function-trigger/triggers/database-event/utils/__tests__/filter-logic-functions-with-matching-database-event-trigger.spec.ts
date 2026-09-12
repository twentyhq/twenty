import { filterLogicFunctionsWithMatchingDatabaseEventTrigger } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/filter-logic-functions-with-matching-database-event-trigger.util';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type LogicFunctionFixture = {
  universalIdentifier: string;
  deletedAt?: string;
  databaseEventTriggerSettings?: { eventName: string };
};

const buildFlatLogicFunctionMaps = (logicFunctions: LogicFunctionFixture[]) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      logicFunctions.map((logicFunction) => [
        logicFunction.universalIdentifier,
        logicFunction,
      ]),
    ),
  }) as unknown as WorkspaceCacheDataMap['flatLogicFunctionMaps'];

describe('filterLogicFunctionsWithMatchingDatabaseEventTrigger', () => {
  it('returns the logic functions triggered by the exact event', () => {
    const logicFunctions = filterLogicFunctionsWithMatchingDatabaseEventTrigger(
      {
        flatLogicFunctionMaps: buildFlatLogicFunctionMaps([
          {
            universalIdentifier: 'exact',
            databaseEventTriggerSettings: { eventName: 'company.updated' },
          },
          {
            universalIdentifier: 'other',
            databaseEventTriggerSettings: { eventName: 'person.created' },
          },
        ]),
        batchEventName: 'company.updated',
      },
    );

    expect(
      logicFunctions.map((logicFunction) => logicFunction.universalIdentifier),
    ).toEqual(['exact']);
  });

  it('returns the logic functions triggered through a wildcard', () => {
    const logicFunctions = filterLogicFunctionsWithMatchingDatabaseEventTrigger(
      {
        flatLogicFunctionMaps: buildFlatLogicFunctionMaps([
          {
            universalIdentifier: 'everything',
            databaseEventTriggerSettings: { eventName: '*.*' },
          },
          {
            universalIdentifier: 'anyCompanyEvent',
            databaseEventTriggerSettings: { eventName: 'company.*' },
          },
        ]),
        batchEventName: 'company.updated',
      },
    );

    expect(
      logicFunctions.map((logicFunction) => logicFunction.universalIdentifier),
    ).toEqual(['everything', 'anyCompanyEvent']);
  });

  it('skips logic functions without a database event trigger', () => {
    expect(
      filterLogicFunctionsWithMatchingDatabaseEventTrigger({
        flatLogicFunctionMaps: buildFlatLogicFunctionMaps([
          { universalIdentifier: 'noTrigger' },
        ]),
        batchEventName: 'company.updated',
      }),
    ).toEqual([]);
  });

  it('skips soft deleted logic functions', () => {
    expect(
      filterLogicFunctionsWithMatchingDatabaseEventTrigger({
        flatLogicFunctionMaps: buildFlatLogicFunctionMaps([
          {
            universalIdentifier: 'deleted',
            deletedAt: '2026-09-11T04:00:00.000Z',
            databaseEventTriggerSettings: { eventName: '*.*' },
          },
        ]),
        batchEventName: 'company.updated',
      }),
    ).toEqual([]);
  });
});
