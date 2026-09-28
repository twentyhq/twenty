import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { VerifyCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790590808102-verify-common-record-sharing.command';

it.each([MetadataReadability.SYSTEM, MetadataReadability.PRIVATE, undefined])(
  'verifies conversation readiness (%s)',
  async (readability) => {
    const command = new VerifyCommonRecordSharingCommand(
      {} as never,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatObjectMetadataMaps: {
            byUniversalIdentifier: {
              [STANDARD_OBJECTS.agentChatThread.universalIdentifier]:
                readability ? { readability } : undefined,
            },
          },
        }),
      } as never,
    );
    const result = command.up({
      workspaceId: 'workspace',
      options: { dryRun: true },
    } as never);
    if (readability === MetadataReadability.SYSTEM) {
      await expect(result).rejects.toThrow(
        'upgrade:2-43:enable-common-record-sharing',
      );
    } else {
      await expect(result).resolves.toBeUndefined();
    }
  },
);
