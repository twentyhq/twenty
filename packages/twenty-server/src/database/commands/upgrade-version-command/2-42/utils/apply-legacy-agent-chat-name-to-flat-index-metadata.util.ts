import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-index-names-by-universal-identifier.constant';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export const applyLegacyAgentChatNameToFlatIndexMetadata = (
  flatIndexMetadata: FlatIndexMetadata,
): FlatIndexMetadata => {
  const legacyAgentChatIndexName =
    LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER[
      flatIndexMetadata.universalIdentifier
    ];

  if (!isDefined(legacyAgentChatIndexName)) {
    return flatIndexMetadata;
  }

  return { ...flatIndexMetadata, name: legacyAgentChatIndexName };
};
