import { type LogicFunction } from '@/logic-functions/types/LogicFunction';
import { sortWorkflowActionLogicFunctions } from '@/side-panel/pages/workflow/action/utils/sortWorkflowActionLogicFunctions';
import { LogicFunctionExecutionMode } from '~/generated-metadata/graphql';

const buildLogicFunction = ({
  id,
  applicationId,
  label,
}: {
  id: string;
  applicationId: string;
  label?: string;
}): LogicFunction => ({
  id,
  name: `${id}-name`,
  runtime: 'nodejs22.x',
  timeoutSeconds: 300,
  executionMode: LogicFunctionExecutionMode.PREBUILT,
  sourceHandlerPath: 'index.ts',
  handlerName: 'main',
  workflowActionTriggerSettings: { label },
  applicationId,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const getIds = (logicFunctions: LogicFunction[]) =>
  logicFunctions.map((logicFunction) => logicFunction.id);

describe('sortWorkflowActionLogicFunctions', () => {
  it('orders by most recently installed application, then by label', () => {
    const sortedLogicFunctions = sortWorkflowActionLogicFunctions({
      logicFunctions: [
        buildLogicFunction({ id: 'old-b', applicationId: 'old', label: 'B' }),
        buildLogicFunction({ id: 'new-b', applicationId: 'new', label: 'B' }),
        buildLogicFunction({ id: 'old-a', applicationId: 'old', label: 'a' }),
        buildLogicFunction({ id: 'new-a', applicationId: 'new', label: 'A' }),
      ],
      installedApplications: [
        { id: 'old', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'new', createdAt: '2025-01-01T00:00:00.000Z' },
      ],
    });

    expect(getIds(sortedLogicFunctions)).toEqual([
      'new-a',
      'new-b',
      'old-a',
      'old-b',
    ]);
  });

  it('keeps applications installed at the same time grouped together', () => {
    const sortedLogicFunctions = sortWorkflowActionLogicFunctions({
      logicFunctions: [
        buildLogicFunction({
          id: 'first-b',
          applicationId: 'first',
          label: 'B',
        }),
        buildLogicFunction({
          id: 'second-a',
          applicationId: 'second',
          label: 'A',
        }),
        buildLogicFunction({
          id: 'first-c',
          applicationId: 'first',
          label: 'C',
        }),
      ],
      installedApplications: [
        { id: 'first', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'second', createdAt: '2024-01-01T00:00:00.000Z' },
      ],
    });

    expect(getIds(sortedLogicFunctions)).toEqual([
      'first-b',
      'first-c',
      'second-a',
    ]);
  });

  it('falls back to the function name when no label is set', () => {
    const sortedLogicFunctions = sortWorkflowActionLogicFunctions({
      logicFunctions: [
        buildLogicFunction({ id: 'zeta', applicationId: 'app' }),
        buildLogicFunction({ id: 'alpha', applicationId: 'app' }),
      ],
      installedApplications: [
        { id: 'app', createdAt: '2024-01-01T00:00:00.000Z' },
      ],
    });

    expect(getIds(sortedLogicFunctions)).toEqual(['alpha', 'zeta']);
  });

  it('places functions of unknown applications last', () => {
    const sortedLogicFunctions = sortWorkflowActionLogicFunctions({
      logicFunctions: [
        buildLogicFunction({
          id: 'unknown',
          applicationId: 'unknown',
          label: 'A',
        }),
        buildLogicFunction({ id: 'known', applicationId: 'known', label: 'Z' }),
      ],
      installedApplications: [
        { id: 'known', createdAt: '2024-01-01T00:00:00.000Z' },
      ],
    });

    expect(getIds(sortedLogicFunctions)).toEqual(['known', 'unknown']);
  });
});
