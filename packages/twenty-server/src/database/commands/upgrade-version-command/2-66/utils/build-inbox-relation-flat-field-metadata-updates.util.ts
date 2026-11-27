import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_RELATION_FIELD_NAME_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-66/constants/inbox-relation-field-name-by-universal-identifier.constant';
import { INBOX_THREAD_TARGETS_RELATION_FIELD_NAME } from 'src/database/commands/upgrade-version-command/2-66/constants/inbox-thread-targets-relation-field-name.constant';
import { LEGACY_AGENT_CHAT_THREAD_TARGETS_RELATION_FIELD_NAME } from 'src/database/commands/upgrade-version-command/2-66/constants/legacy-agent-chat-thread-targets-relation-field-name.constant';
import { renameFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/2-66/utils/rename-flat-field-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const resolveInboxRelationFieldName = (
  flatFieldMetadata: FlatFieldMetadata,
): string | undefined => {
  const isLegacyThreadTargetsRelationField =
    flatFieldMetadata.type === FieldMetadataType.RELATION &&
    flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier &&
    flatFieldMetadata.name ===
      LEGACY_AGENT_CHAT_THREAD_TARGETS_RELATION_FIELD_NAME;

  return (
    INBOX_RELATION_FIELD_NAME_BY_UNIVERSAL_IDENTIFIER[
      flatFieldMetadata.universalIdentifier
    ] ??
    (isLegacyThreadTargetsRelationField
      ? INBOX_THREAD_TARGETS_RELATION_FIELD_NAME
      : undefined)
  );
};

export const buildInboxRelationFlatFieldMetadataUpdates = ({
  flatFieldMetadataMaps,
  now,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
}): FlatFieldMetadata[] =>
  Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((flatFieldMetadata) => {
      const name = resolveInboxRelationFieldName(flatFieldMetadata);

      if (!isDefined(name) || flatFieldMetadata.name === name) {
        return [];
      }

      return [renameFlatFieldMetadata({ flatFieldMetadata, name, now })];
    });
