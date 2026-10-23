import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AddChatMentionResolutionCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792768675515-add-chat-mention-resolution.command';

jest.mock(
  'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util',
  () => ({ getStandardFlatEntitiesToCreateOrThrow: () => [] }),
);
jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
  () => ({
    computeTwentyStandardApplicationAllFlatEntityMaps: () => ({
      allFlatEntityMaps: { flatFieldMetadataMaps: {} },
    }),
  }),
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('AddChatMentionResolutionCommand', () => {
  it('continues a full candidate batch when concurrent mention changes reduce updated rows', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ candidateCount: 1000, resolvedCount: 999 }])
      .mockResolvedValueOnce([{ candidateCount: 1, resolvedCount: 1 }]);
    const command = new AddChatMentionResolutionCommand(
      {} as never,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: 'standard' },
          }),
      } as never,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatObjectMetadataMaps: {
            byUniversalIdentifier: {
              [STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier]:
                {
                  id: 'participant-metadata',
                },
            },
          },
          flatFieldMetadataMaps: {},
        }),
      } as never,
      {} as never,
      { query } as never,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(2);
  });
});
