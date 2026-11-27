import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-relation-field-names-by-universal-identifier.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const applyLegacyAgentChatNameAndJoinColumnNameToFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): FlatFieldMetadata => {
  const legacyAgentChatRelationFieldNames =
    LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER[
      flatFieldMetadata.universalIdentifier
    ];

  if (!isDefined(legacyAgentChatRelationFieldNames)) {
    return flatFieldMetadata;
  }

  const { name: legacyFieldName, joinColumnName: legacyJoinColumnName } =
    legacyAgentChatRelationFieldNames;

  if (
    !isDefined(legacyJoinColumnName) ||
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
  ) {
    return { ...flatFieldMetadata, name: legacyFieldName };
  }

  return {
    ...flatFieldMetadata,
    name: legacyFieldName,
    settings: {
      ...flatFieldMetadata.settings,
      joinColumnName: legacyJoinColumnName,
    },
    universalSettings: {
      ...flatFieldMetadata.universalSettings,
      joinColumnName: legacyJoinColumnName,
    },
  };
};
