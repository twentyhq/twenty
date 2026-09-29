import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-44/constants/agent-chat-thread-archived-at-field-universal-identifier.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildAgentChatThreadArchivedAtWritabilityUpdate = ({
  flatFieldMetadatasByUniversalIdentifier,
  now,
  direction,
}: {
  flatFieldMetadatasByUniversalIdentifier: Partial<
    Record<string, FlatFieldMetadata>
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatFieldMetadata[] => {
  const archivedAtField =
    flatFieldMetadatasByUniversalIdentifier[
      AGENT_CHAT_THREAD_ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER
    ];

  const writability =
    direction === 'up'
      ? MetadataWritability.OPEN
      : MetadataWritability.SYSTEM;

  if (
    !isDefined(archivedAtField) ||
    archivedAtField.writability === writability
  ) {
    return [];
  }

  return [{ ...archivedAtField, writability, updatedAt: now }];
};
