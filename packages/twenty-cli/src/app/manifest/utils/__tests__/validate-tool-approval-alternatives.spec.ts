import { describe, expect, it } from 'vitest';

import { type LogicFunctionManifest } from 'twenty-shared/application';

import { validateToolApprovalAlternatives } from '@/app/manifest/utils/validate-tool-approval-alternatives';

const ACCEPT_UNIVERSAL_IDENTIFIER = '0b1c6f8e-5a4d-4f3e-9c2b-1a0d9e8f7c01';
const DECLINE_UNIVERSAL_IDENTIFIER = '0b1c6f8e-5a4d-4f3e-9c2b-1a0d9e8f7c02';
const CRON_UNIVERSAL_IDENTIFIER = '0b1c6f8e-5a4d-4f3e-9c2b-1a0d9e8f7c03';

const buildLogicFunction = (
  overrides: Partial<LogicFunctionManifest>,
): LogicFunctionManifest => ({
  universalIdentifier: ACCEPT_UNIVERSAL_IDENTIFIER,
  name: 'accept-cal-booking',
  sourceHandlerPath: 'src/logic-functions/accept-cal-booking.ts',
  builtHandlerPath: 'src/logic-functions/accept-cal-booking.mjs',
  builtHandlerChecksum: '[default-checksum]',
  handlerName: 'default.config.handler',
  ...overrides,
});

const buildAcceptTool = (logicFunctionUniversalIdentifier: string) =>
  buildLogicFunction({
    toolTriggerSettings: {
      approval: {
        approveLabel: 'Accept meeting',
        alternatives: [{ logicFunctionUniversalIdentifier, label: 'Decline' }],
      },
    },
  });

describe('validateToolApprovalAlternatives', () => {
  it('accepts an alternative that is another tool of the application', () => {
    expect(
      validateToolApprovalAlternatives({
        logicFunctions: [
          buildAcceptTool(DECLINE_UNIVERSAL_IDENTIFIER),
          buildLogicFunction({
            universalIdentifier: DECLINE_UNIVERSAL_IDENTIFIER,
            name: 'decline-cal-booking',
            toolTriggerSettings: {},
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('rejects an alternative that is missing, not a tool, or the tool itself', () => {
    const expectedError = (logicFunctionUniversalIdentifier: string) =>
      `Tool "accept-cal-booking" offers approval alternative "Decline" running "${logicFunctionUniversalIdentifier}", which is not another tool of this application.`;
    const cronFunction = buildLogicFunction({
      universalIdentifier: CRON_UNIVERSAL_IDENTIFIER,
      name: 'sync-bookings',
      cronTriggerSettings: { pattern: '0 * * * *' },
    });

    expect(
      validateToolApprovalAlternatives({
        logicFunctions: [buildAcceptTool(DECLINE_UNIVERSAL_IDENTIFIER)],
      }),
    ).toEqual([expectedError(DECLINE_UNIVERSAL_IDENTIFIER)]);
    expect(
      validateToolApprovalAlternatives({
        logicFunctions: [
          buildAcceptTool(CRON_UNIVERSAL_IDENTIFIER),
          cronFunction,
        ],
      }),
    ).toEqual([expectedError(CRON_UNIVERSAL_IDENTIFIER)]);
    expect(
      validateToolApprovalAlternatives({
        logicFunctions: [buildAcceptTool(ACCEPT_UNIVERSAL_IDENTIFIER)],
      }),
    ).toEqual([expectedError(ACCEPT_UNIVERSAL_IDENTIFIER)]);
  });
});
