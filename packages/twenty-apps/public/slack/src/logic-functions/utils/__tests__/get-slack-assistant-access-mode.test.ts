import { afterEach, describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_ACCESS_ENV_VAR } from 'src/logic-functions/constants/slack-assistant-access-env-var';
import { SLACK_ASSISTANT_ACCESS_MODE } from 'src/logic-functions/constants/slack-assistant-access-mode';
import { getSlackAssistantAccessMode } from 'src/logic-functions/utils/get-slack-assistant-access-mode';

const setAccessVariable = (value: string | undefined) => {
  if (value === undefined) {
    delete process.env[SLACK_ASSISTANT_ACCESS_ENV_VAR];

    return;
  }

  process.env[SLACK_ASSISTANT_ACCESS_ENV_VAR] = value;
};

describe('getSlackAssistantAccessMode', () => {
  afterEach(() => {
    setAccessVariable(undefined);
  });

  it('should stay open when the workspace has not set the variable', () => {
    expect(getSlackAssistantAccessMode()).toBe(
      SLACK_ASSISTANT_ACCESS_MODE.EVERYONE,
    );
  });

  it('should restrict to linked members when the admin selected it', () => {
    setAccessVariable(SLACK_ASSISTANT_ACCESS_MODE.LINKED_MEMBERS_ONLY);

    expect(getSlackAssistantAccessMode()).toBe(
      SLACK_ASSISTANT_ACCESS_MODE.LINKED_MEMBERS_ONLY,
    );
  });

  it('should accept the selected value regardless of case and padding', () => {
    setAccessVariable('  linked_members_only ');

    expect(getSlackAssistantAccessMode()).toBe(
      SLACK_ASSISTANT_ACCESS_MODE.LINKED_MEMBERS_ONLY,
    );
  });

  it('should stay open on an unknown value', () => {
    setAccessVariable('ADMINS_ONLY');

    expect(getSlackAssistantAccessMode()).toBe(
      SLACK_ASSISTANT_ACCESS_MODE.EVERYONE,
    );
  });

  it('should stay open on an empty value', () => {
    setAccessVariable('');

    expect(getSlackAssistantAccessMode()).toBe(
      SLACK_ASSISTANT_ACCESS_MODE.EVERYONE,
    );
  });
});
