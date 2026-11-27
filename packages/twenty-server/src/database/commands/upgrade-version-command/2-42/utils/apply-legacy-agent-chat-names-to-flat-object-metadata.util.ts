import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-object-names-by-universal-identifier.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const applyLegacyAgentChatNamesToFlatObjectMetadata = (
  flatObjectMetadata: FlatObjectMetadata,
): FlatObjectMetadata => {
  const legacyAgentChatObjectNames =
    LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER[
      flatObjectMetadata.universalIdentifier
    ];

  if (!isDefined(legacyAgentChatObjectNames)) {
    return flatObjectMetadata;
  }

  return {
    ...flatObjectMetadata,
    nameSingular: legacyAgentChatObjectNames.nameSingular,
    namePlural: legacyAgentChatObjectNames.namePlural,
  };
};
