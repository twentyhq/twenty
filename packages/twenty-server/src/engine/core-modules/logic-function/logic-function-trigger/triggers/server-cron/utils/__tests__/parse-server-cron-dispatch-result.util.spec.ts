import { SERVER_CRON_MAX_DISPATCH_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-dispatch-payload-size-bytes.constant';
import { SERVER_CRON_MAX_DISPATCHES_PER_STEP } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-dispatches-per-step.constant';
import { SERVER_CRON_MAX_RESULT_SIZE_BYTES } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-result-size-bytes.constant';
import { parseServerCronDispatchResult } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/parse-server-cron-dispatch-result.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const OTHER_WORKSPACE_ID = '20202020-2c25-4d02-bf25-6aeccf7ea419';
const TARGET_UNIVERSAL_IDENTIFIER = 'a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d';

const buildDispatch = (workspaceId = WORKSPACE_ID) => ({
  workspaceId,
  targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
  payload: { bots: [{ id: 'bot-1' }] },
});

describe('parseServerCronDispatchResult', () => {
  it('accepts dispatches with a continuation', () => {
    const parseOutcome = parseServerCronDispatchResult({
      dispatches: [
        { ...buildDispatch(), delayMs: 1_000 },
        buildDispatch(OTHER_WORKSPACE_ID),
      ],
      next: { cursor: { nextPath: '/bot/?cursor=abc' }, delayMs: 20_000 },
    });

    expect(parseOutcome).toEqual({
      isValid: true,
      dispatchResult: {
        dispatches: [
          { ...buildDispatch(), delayMs: 1_000 },
          buildDispatch(OTHER_WORKSPACE_ID),
        ],
        next: { cursor: { nextPath: '/bot/?cursor=abc' }, delayMs: 20_000 },
      },
    });
  });

  it('accepts an empty dispatch list without continuation', () => {
    expect(parseServerCronDispatchResult({ dispatches: [] })).toEqual({
      isValid: true,
      dispatchResult: { dispatches: [] },
    });
  });

  it('treats a null continuation as no continuation', () => {
    expect(
      parseServerCronDispatchResult({ dispatches: [], next: null }),
    ).toEqual({ isValid: true, dispatchResult: { dispatches: [] } });
  });

  it.each([
    ['a null result', null],
    ['a missing dispatch list', {}],
    [
      'a workspace id that is not a uuid',
      { dispatches: [buildDispatch('workspace-1')] },
    ],
    [
      'a target that is not a uuid',
      {
        dispatches: [
          {
            workspaceId: WORKSPACE_ID,
            targetLogicFunctionUniversalIdentifier: 'target',
          },
        ],
      },
    ],
    [
      'an array payload',
      { dispatches: [{ ...buildDispatch(), payload: ['bot-1'] }] },
    ],
    ['a negative delay', { dispatches: [{ ...buildDispatch(), delayMs: -1 }] }],
    [
      'a delay beyond one day',
      { dispatches: [{ ...buildDispatch(), delayMs: 25 * 60 * 60 * 1000 }] },
    ],
    [
      'a continuation delay beyond 15 minutes',
      { dispatches: [], next: { cursor: {}, delayMs: 16 * 60 * 1000 } },
    ],
    [
      'a continuation without cursor',
      { dispatches: [], next: { delayMs: 1_000 } },
    ],
    ['an unknown key', { dispatches: [], workspaceIds: [WORKSPACE_ID] }],
    [
      'a duplicate dispatch',
      { dispatches: [buildDispatch(), buildDispatch()] },
    ],
    [
      'too many dispatches',
      {
        dispatches: Array.from(
          { length: SERVER_CRON_MAX_DISPATCHES_PER_STEP + 1 },
          (_, index) => ({
            workspaceId: `20202020-${String(index).padStart(4, '0')}-4d02-bf25-6aeccf7ea419`,
            targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
          }),
        ),
      },
    ],
    [
      'an oversized dispatch payload',
      {
        dispatches: [
          {
            ...buildDispatch(),
            payload: {
              data: 'x'.repeat(SERVER_CRON_MAX_DISPATCH_PAYLOAD_SIZE_BYTES),
            },
          },
        ],
      },
    ],
    [
      'an oversized cursor',
      {
        dispatches: [],
        next: { cursor: { data: 'x'.repeat(64 * 1024) } },
      },
    ],
    [
      'an oversized result',
      {
        dispatches: [],
        padding: 'x'.repeat(SERVER_CRON_MAX_RESULT_SIZE_BYTES),
      },
    ],
  ])('rejects %s', (_label, data) => {
    const parseOutcome = parseServerCronDispatchResult(data);

    expect(parseOutcome.isValid).toBe(false);
  });
});
