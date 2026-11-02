import { describe, expect, it } from 'vitest';

import { executeDeployedFunctionOrThrow } from './execute-deployed-function-or-throw';

describe('LinkedIn app deployed functions', () => {
  it('points the workspace settings page to the member app preferences', async () => {
    const execution = await executeDeployedFunctionOrThrow({
      functionName: 'linkedin-health-check',
    });

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toMatchObject({
      status: 'INFO',
      action: {
        location: `/settings/accounts/applications/${execution.applicationId}`,
      },
    });
  });

  it('uninstalls cleanly when no LinkedIn account is connected', async () => {
    const execution = await executeDeployedFunctionOrThrow({
      functionName: 'linkedin-uninstall',
    });

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      removedConnectionCount: 0,
    });
  });
});
