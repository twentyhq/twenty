import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { type AgentManifest } from 'twenty-shared/application';

import { fromFlatAgentToAgentManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-agent-to-agent-manifest.util';
import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const AGENT_UID = '22222222-2222-4222-8222-222222222222';
const ROLE_UID = '33333333-3333-4333-8333-333333333333';
const CRON_TRIGGER_UID = '44444444-4444-4444-8444-444444444444';
const DATABASE_EVENT_TRIGGER_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-14T10:00:00.000Z';

const AGENT_MANIFEST: Required<
  Omit<AgentManifest, 'modelConfiguration' | 'isSystem'>
> = {
  universalIdentifier: AGENT_UID,
  name: 'lead-scorer',
  label: 'Lead Scorer',
  icon: 'IconRobot',
  description: 'Scores new leads',
  prompt: 'Score the lead and explain your reasoning.',
  modelId: 'gpt-4o',
  responseFormat: {
    type: 'json',
    schema: {
      type: 'object',
      properties: { score: { type: 'number', description: 'From 0 to 100' } },
      required: ['score'],
      additionalProperties: false,
    },
  },
  roleUniversalIdentifier: ROLE_UID,
  triggers: [
    {
      universalIdentifier: CRON_TRIGGER_UID,
      type: 'CRON',
      settings: { pattern: '0 9 * * 1' },
      isActive: false,
      instructions: 'Rescore stale leads',
    },
    {
      universalIdentifier: DATABASE_EVENT_TRIGGER_UID,
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.updated',
        updatedFields: ['name'],
        batchMode: true,
      },
    },
  ],
};

const MINIMAL_AGENT_MANIFEST: AgentManifest = {
  universalIdentifier: AGENT_UID,
  name: 'assistant',
  label: 'Assistant',
  prompt: 'Help the user.',
  responseFormat: { type: 'text' },
};

const forward = (agentManifest: AgentManifest) =>
  fromAgentManifestToUniversalFlatAgent({
    agentManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatAgentToAgentManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatAgentToAgentManifest({
        flatAgent: forward(AGENT_MANIFEST),
        roleUniversalIdentifier: ROLE_UID,
      }),
    ).toEqual(AGENT_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatAgent: UniversalFlatAgent = {
      ...forward(AGENT_MANIFEST),
      icon: null,
      description: null,
      modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
      triggers: [
        {
          id: CRON_TRIGGER_UID,
          type: 'CRON',
          settings: { pattern: '0 9 * * 1' },
          isActive: true,
          instructions: null,
        },
      ],
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatAgent,
        toUniversalFlatEntity: forward(
          fromFlatAgentToAgentManifest({ flatAgent }),
        ),
        metadataName: 'agent',
      }),
    ).toBeUndefined();
  });

  it('should omit what the forward conversion defaults: icon, description, the workspace default model, triggers and the role', () => {
    expect(
      fromFlatAgentToAgentManifest({
        flatAgent: forward(MINIMAL_AGENT_MANIFEST),
      }),
    ).toStrictEqual(MINIMAL_AGENT_MANIFEST);
  });

  it('should keep a text response format so the definition does not rely on its default', () => {
    const { responseFormat: _responseFormat, ...manifestWithoutFormat } =
      MINIMAL_AGENT_MANIFEST;

    expect(
      fromFlatAgentToAgentManifest({
        flatAgent: forward(manifestWithoutFormat),
      }).responseFormat,
    ).toEqual({ type: 'text' });
  });
});
