import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-relation-field-names-by-universal-identifier.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const applyLegacyAgentChatRelationFieldName = (
  flatFieldMetadata: FlatFieldMetadata,
): FlatFieldMetadata => {
  const legacyNames =
    LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER[
      flatFieldMetadata.universalIdentifier
    ];

  if (!isDefined(legacyNames)) {
    return flatFieldMetadata;
  }

  const { name, joinColumnName } = legacyNames;

  if (
    !isDefined(joinColumnName) ||
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
  ) {
    return { ...flatFieldMetadata, name };
  }

  return {
    ...flatFieldMetadata,
    name,
    settings: { ...flatFieldMetadata.settings, joinColumnName },
    universalSettings: {
      ...flatFieldMetadata.universalSettings,
      joinColumnName,
    },
  };
};
