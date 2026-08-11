import { randomUUID } from 'crypto';

import { describe, expect, it } from 'vitest';

import {
  SLACK_APP_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type ReleaseSlackTeamClaimResult } from 'src/logic-functions/types/release-slack-team-claim-result.type';
import {
  runFailingSlackLogicFunction,
  runSlackLogicFunction,
} from 'src/__tests__/utils/execute-slack-logic-function';

describe('Slack connection lifecycle hooks', () => {
  it('should refuse to register a connection without a connected account', async () => {
    const { errorMessage } = await runFailingSlackLogicFunction({
      universalIdentifier: SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
      payload: {
        connectionProviderId: randomUUID(),
        connectionProviderName: 'slack',
        connectedAccountId: '',
      },
    });

    expect(errorMessage).toContain(
      'onConnect payload is missing connectedAccountId',
    );
  });

  it('should refuse to release a team without a connected account', async () => {
    const { errorMessage } = await runFailingSlackLogicFunction({
      universalIdentifier: SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        connectionProviderId: randomUUID(),
        connectionProviderName: 'slack',
        connectedAccountId: '',
      },
    });

    expect(errorMessage).toContain(
      'onDisconnect payload is missing connectedAccountId',
    );
  });

  it('should release nothing when the disconnected account never claimed a team', async () => {
    const result = await runSlackLogicFunction<ReleaseSlackTeamClaimResult>({
      universalIdentifier: SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: {
        connectionProviderId: randomUUID(),
        connectionProviderName: 'slack',
        connectedAccountId: randomUUID(),
      },
    });

    expect(result).toEqual({ ok: true, releasedTeamId: null });
  });

  it('should release every remaining team claim on uninstall', async () => {
    const result = await runSlackLogicFunction<{
      ok: boolean;
      releasedTeamIds: string[];
    }>({
      universalIdentifier: SLACK_APP_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });

    expect(result).toEqual({ ok: true, releasedTeamIds: [] });
  });
});
