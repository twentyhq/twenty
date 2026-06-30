import { getLogicFunctionTriggerLabel } from '@/logic-functions/utils/getLogicFunctionTriggerLabel';

describe('getLogicFunctionTriggerLabel', () => {
  it('returns Post-install when the function matches the post-install identifier', () => {
    expect(
      getLogicFunctionTriggerLabel(
        { universalIdentifier: 'uid-post' },
        { postInstallUniversalIdentifier: 'uid-post' },
      ),
    ).toBe('Post-install');
  });

  it('returns Pre-install when the function matches the pre-install identifier', () => {
    expect(
      getLogicFunctionTriggerLabel(
        { universalIdentifier: 'uid-pre' },
        { preInstallUniversalIdentifier: 'uid-pre' },
      ),
    ).toBe('Pre-install');
  });

  it('does not match when both identifiers are undefined', () => {
    expect(getLogicFunctionTriggerLabel({}, {})).toBe('');
  });

  it('returns AI tool when toolTriggerSettings is set', () => {
    expect(
      getLogicFunctionTriggerLabel({
        toolTriggerSettings: { inputSchema: { type: 'object' } },
      }),
    ).toBe('AI tool');
  });

  it('returns Workflow action when workflowActionTriggerSettings is set', () => {
    expect(
      getLogicFunctionTriggerLabel({
        workflowActionTriggerSettings: { inputSchema: [] },
      }),
    ).toBe('Workflow action');
  });

  it('returns Cron when cron settings are present', () => {
    expect(getLogicFunctionTriggerLabel({ cronTriggerSettings: {} })).toBe(
      'Cron',
    );
  });

  it('returns HTTP when http settings are present', () => {
    expect(getLogicFunctionTriggerLabel({ httpRouteTriggerSettings: {} })).toBe(
      'HTTP',
    );
  });

  it('returns the database event name when it exists', () => {
    expect(
      getLogicFunctionTriggerLabel({
        databaseEventTriggerSettings: { eventName: 'person.created' },
      }),
    ).toBe('person.created');
  });

  it('falls back to a generic label when the database event name is missing', () => {
    expect(
      getLogicFunctionTriggerLabel({ databaseEventTriggerSettings: {} }),
    ).toBe('Database event');
  });
});
