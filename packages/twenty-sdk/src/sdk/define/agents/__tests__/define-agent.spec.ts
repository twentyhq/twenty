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
