import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const findAgentChatChannelRoleUniversalIdentifiersOrThrow = ({
  flatRoleMaps,
  roleIds,
}: {
  flatRoleMaps: Pick<FlatEntityMaps<FlatRole>, 'universalIdentifierById'>;
  roleIds: string[];
}): string[] =>
  [...new Set(roleIds)].map((roleId) => {
    const roleUniversalIdentifier =
      flatRoleMaps.universalIdentifierById[roleId];

    if (!isDefined(roleUniversalIdentifier)) {
      throw new AiException(
        'A channel can only be open to roles of its workspace',
        AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
      );
    }

    return roleUniversalIdentifier;
  });
