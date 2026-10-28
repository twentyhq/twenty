/* @license Enterprise */

import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export type RecordSharePrincipalMaps = {
  flatWorkspaceMemberMaps: {
    byId: Partial<Record<string, Pick<FlatWorkspaceMember, 'deletedAt'>>>;
  };
  flatRoleMaps: Pick<FlatRoleMaps, 'universalIdentifierById'>;
};
