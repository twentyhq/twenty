import { defineAgent } from '@/sdk/define/agents/define-agent';

const VALID_AGENT_CONFIG = {
  universalIdentifier: 'a29ae15d-dd16-4b99-bb6c-079842da55ab',
  name: 'sales-assistant',
  label: 'Sales Assistant',
  prompt: 'You are a sales assistant.',
  responseFormat: { type: 'text' as const },
};

describe('defineAgent', () => {
  it('should accept a valid agent config', () => {
    const result = defineAgent(VALID_AGENT_CONFIG);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config).toEqual(VALID_AGENT_CONFIG);
  });

  it('should accept an optional roleUniversalIdentifier', () => {
    const roleUniversalIdentifier = 'b7d36e10-2a8d-4c1b-9e50-8bfd6c3a1940';
    const result = defineAgent({
      ...VALID_AGENT_CONFIG,
      roleUniversalIdentifier,
    });

    expect(result.success).toBe(true);
    expect(result.config?.roleUniversalIdentifier).toBe(
      roleUniversalIdentifier,
    );
  });

  it('should error when roleUniversalIdentifier is not a valid UUID', () => {
    const result = defineAgent({
      ...VALID_AGENT_CONFIG,
      roleUniversalIdentifier: 'not-a-uuid',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      `Agent 'sales-assistant' roleUniversalIdentifier must be a valid UUID`,
    );
  });

  it('should accept triggers', () => {
    const result = defineAgent({
      ...VALID_AGENT_CONFIG,
      triggers: [
        {
          universalIdentifier: 'c1f0a7b2-5d3e-4f6a-8b9c-0d1e2f3a4b5c',
          type: 'DATABASE_EVENT',
          settings: { eventName: 'company.created' },
          instructions: 'Qualify the new company',
        },
        {
          universalIdentifier: 'd2e1b8c3-6e4f-4a7b-9c0d-1e2f3a4b5c6d',
          type: 'CRON',
          settings: { pattern: '0 9 * * 1' },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should error when a trigger universalIdentifier is not a valid UUID', () => {
    const result = defineAgent({
      ...VALID_AGENT_CONFIG,
      triggers: [
        {
          universalIdentifier: 'weekly-digest',
          type: 'CRON',
          settings: { pattern: '0 9 * * 1' },
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      `Agent 'sales-assistant' trigger universalIdentifier must be a valid UUID`,
    );
  });

  it('should error on duplicated triggers and wildcard event names', () => {
    const trigger = {
      universalIdentifier: 'c1f0a7b2-5d3e-4f6a-8b9c-0d1e2f3a4b5c',
      type: 'DATABASE_EVENT' as const,
      settings: { eventName: '*.created' },
    };

    const result = defineAgent({
      ...VALID_AGENT_CONFIG,
      triggers: [trigger, trigger],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        `Agent 'sales-assistant' trigger universalIdentifiers must be unique`,
        `Agent 'sales-assistant' trigger event name '*.created' must look like 'company.created'`,
      ]),
    );
  });

  it('should error instead of throwing when a database event trigger has no settings', () => {
    const result = defineAgent({
      ...VALID_AGENT_CONFIG,
      triggers: [
        // @ts-expect-error apps written in JavaScript can omit settings
        {
          universalIdentifier: 'c1f0a7b2-5d3e-4f6a-8b9c-0d1e2f3a4b5c',
          type: 'DATABASE_EVENT',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      `Agent 'sales-assistant' trigger event name 'undefined' must look like 'company.created'`,
    );
  });

  it('should warn when responseFormat is missing', () => {
    const { responseFormat: _responseFormat, ...configWithoutFormat } =
      VALID_AGENT_CONFIG;
    const result = defineAgent(configWithoutFormat);

    expect(result.success).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('has no responseFormat'),
      ]),
    );
  });
});
