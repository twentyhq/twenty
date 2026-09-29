import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';

import { AGENT_CHAT_THREAD_ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-44/constants/agent-chat-thread-archived-at-field-universal-identifier.constant';
import { buildAgentChatThreadArchivedAtWritabilityUpdate } from 'src/database/commands/upgrade-version-command/2-44/utils/build-agent-chat-thread-archived-at-writability-update.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const NOW = '2026-09-29T10:00:00.000Z';

const buildFieldsByUniversalIdentifier = (writability: MetadataWritability) => ({
  [AGENT_CHAT_THREAD_ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER]:
    getFlatFieldMetadataMock({
      universalIdentifier: AGENT_CHAT_THREAD_ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataId: 'agent-chat-thread-object-id',
      type: FieldMetadataType.DATE_TIME,
      name: 'archivedAt',
      writability,
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
});

describe('buildAgentChatThreadArchivedAtWritabilityUpdate', () => {
  it('opens archivedAt on the way up', () => {
    expect(
      buildAgentChatThreadArchivedAtWritabilityUpdate({
        flatFieldMetadatasByUniversalIdentifier:
          buildFieldsByUniversalIdentifier(MetadataWritability.SYSTEM),
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([
      expect.objectContaining({
        name: 'archivedAt',
        writability: MetadataWritability.OPEN,
        updatedAt: NOW,
      }),
    ]);
  });

  it('closes archivedAt again on the way down', () => {
    expect(
      buildAgentChatThreadArchivedAtWritabilityUpdate({
        flatFieldMetadatasByUniversalIdentifier:
          buildFieldsByUniversalIdentifier(MetadataWritability.OPEN),
        now: NOW,
        direction: 'down',
      }),
    ).toEqual([
      expect.objectContaining({ writability: MetadataWritability.SYSTEM }),
    ]);
  });

  it('changes nothing when the field is already in place or missing', () => {
    expect(
      buildAgentChatThreadArchivedAtWritabilityUpdate({
        flatFieldMetadatasByUniversalIdentifier:
          buildFieldsByUniversalIdentifier(MetadataWritability.OPEN),
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
    expect(
      buildAgentChatThreadArchivedAtWritabilityUpdate({
        flatFieldMetadatasByUniversalIdentifier: {},
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });
});
