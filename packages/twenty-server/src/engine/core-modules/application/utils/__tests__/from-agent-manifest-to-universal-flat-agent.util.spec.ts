import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { type AgentManifest } from 'twenty-shared/application';

import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-27T10:00:00.000Z';

const AGENT_MANIFEST: AgentManifest = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'sales-assistant',
  label: 'Sales Assistant',
  prompt: 'Help the sales team.',
};

const convert = (agentManifest: AgentManifest) =>
  fromAgentManifestToUniversalFlatAgent({
    agentManifest,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  });

describe('fromAgentManifestToUniversalFlatAgent', () => {
  it('defaults the optional properties', () => {
    expect(convert(AGENT_MANIFEST)).toMatchObject({
      universalIdentifier: AGENT_MANIFEST.universalIdentifier,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      icon: null,
      description: null,
      modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
      responseFormat: { type: 'text' },
      modelConfiguration: null,
      triggers: [],
      isSystem: false,
    });
  });

  it('keeps the model configuration and isSystem of the definition', () => {
    const modelConfiguration = {
      webSearch: { enabled: true, configuration: { maxResults: 5 } },
      twitterSearch: { enabled: false },
    };

    expect(
      convert({ ...AGENT_MANIFEST, modelConfiguration, isSystem: true }),
    ).toMatchObject({ modelConfiguration, isSystem: true });
  });

  it('gives the triggers their universal identifier as id', () => {
    const triggerUniversalIdentifier = '22222222-2222-4222-8222-222222222222';

    expect(
      convert({
        ...AGENT_MANIFEST,
        triggers: [
          {
            universalIdentifier: triggerUniversalIdentifier,
            type: 'CRON',
            settings: { pattern: '0 9 * * 1' },
          },
        ],
      }).triggers,
    ).toEqual([
      {
        id: triggerUniversalIdentifier,
        type: 'CRON',
        settings: { pattern: '0 9 * * 1' },
        isActive: true,
        instructions: null,
      },
    ]);
  });
});
