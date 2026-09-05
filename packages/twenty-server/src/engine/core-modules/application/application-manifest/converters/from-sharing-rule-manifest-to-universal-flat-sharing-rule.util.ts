import { type SharingRuleManifest } from 'twenty-shared/application';

import { type UniversalFlatSharingRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-sharing-rule.type';

export const fromSharingRuleManifestToUniversalFlatSharingRule = ({
  sharingRuleManifest,
  applicationUniversalIdentifier,
  now,
}: {
  sharingRuleManifest: SharingRuleManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatSharingRule => ({
  universalIdentifier: sharingRuleManifest.universalIdentifier,
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier:
    sharingRuleManifest.objectUniversalIdentifier,
  name: sharingRuleManifest.name,
  description: sharingRuleManifest.description ?? null,
  granteePrincipalType: sharingRuleManifest.granteePrincipalType,
  granteeRoleUniversalIdentifier:
    sharingRuleManifest.granteeRoleUniversalIdentifier ?? null,
  granteePrincipalId: sharingRuleManifest.granteePrincipalId ?? null,
  accessLevel: sharingRuleManifest.accessLevel,
  isActive: sharingRuleManifest.isActive ?? true,
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});
