import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { buildWorkflowManifestExportReferences } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-export-references.util';
import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';

const EXPORTED_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000001';
const UNEXPORTED_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000002';

const buildFlatAgent = (universalIdentifier: string): FlatAgent => ({
  ...fromAgentManifestToUniversalFlatAgent({
    agentManifest: {
      universalIdentifier,
      name: `agent-${universalIdentifier.slice(-1)}`,
      label: 'Agent',
      prompt: 'Help the user.',
      responseFormat: { type: 'text' },
    },
    applicationUniversalIdentifier: '10000000-0000-4000-8000-000000000001',
    now: '2026-10-31T10:00:00.000Z',
  }),
  id: `${universalIdentifier}-id`,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
});

describe('buildWorkflowManifestExportReferences', () => {
  it('resolves only the agents the application exports, the ones apply will know', () => {
    const maps = createEmptyAllFlatEntityMaps();
    const applicationAllFlatEntityMaps = {
      ...maps,
      flatAgentMaps: addAllFlatEntitiesToFlatEntityMaps({
        flatEntities: [
          buildFlatAgent(EXPORTED_AGENT_UNIVERSAL_IDENTIFIER),
          buildFlatAgent(UNEXPORTED_AGENT_UNIVERSAL_IDENTIFIER),
        ],
        flatEntityMaps: maps.flatAgentMaps,
      }),
    };

    const references = buildWorkflowManifestExportReferences({
      applicationAllFlatEntityMaps,
      allFlatEntityMaps: applicationAllFlatEntityMaps,
      exportedObjectUniversalIdentifiers: new Set(),
      resolvableFieldUniversalIdentifiers: new Set(),
      exportedAgentUniversalIdentifiers: new Set([
        EXPORTED_AGENT_UNIVERSAL_IDENTIFIER,
      ]),
      canReferenceOtherApplicationsWorkflowActions: false,
    });

    expect([
      ...(references.agentIdByUniversalIdentifier?.keys() ?? []),
    ]).toEqual([EXPORTED_AGENT_UNIVERSAL_IDENTIFIER]);
    expect([
      ...(references.agentOutputSchemaByUniversalIdentifier?.keys() ?? []),
    ]).toEqual([EXPORTED_AGENT_UNIVERSAL_IDENTIFIER]);
  });
});
