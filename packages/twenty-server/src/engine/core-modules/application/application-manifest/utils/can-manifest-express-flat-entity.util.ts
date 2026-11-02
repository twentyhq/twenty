import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const METADATA_NAMES_WITHOUT_MANIFEST_REPRESENTATION: AllMetadataName[] = [
  'webhook',
  'workflowVersion',
];

const WORKSPACE_BOUND_PROPERTIES = [
  'userWorkspaceId',
  'apiKeyId',
  'webhookId',
  'targetApplicationId',
  'workflowVersionId',
  'coreWorkflowVersionId',
  'targetRecordId',
] as const;

// A non-editable role is not in manifests, so neither are the permissions it holds
const ROLE_PERMISSION_METADATA_NAMES: AllMetadataName[] = [
  'objectPermission',
  'fieldPermission',
  'rolePermissionFlag',
  'rowLevelPermissionPredicate',
  'rowLevelPermissionPredicateGroup',
];

type ProbedPropertyName =
  | (typeof WORKSPACE_BOUND_PROPERTIES)[number]
  | 'frontComponentUniversalIdentifier'
  | 'roleUniversalIdentifier';

type ProbedFlatEntity = {
  universalIdentifier: string;
  isEditable?: boolean;
} & Partial<Record<ProbedPropertyName, string | null>>;

export const canManifestExpressFlatEntity = ({
  metadataName,
  flatEntity,
  nonEditableRoleUniversalIdentifiers = new Set(),
}: {
  metadataName: AllMetadataName;
  flatEntity: ProbedFlatEntity;
  nonEditableRoleUniversalIdentifiers?: Set<string>;
}): boolean => {
  if (METADATA_NAMES_WITHOUT_MANIFEST_REPRESENTATION.includes(metadataName)) {
    return false;
  }

  if (
    WORKSPACE_BOUND_PROPERTIES.some((workspaceBoundProperty) =>
      isDefined(flatEntity[workspaceBoundProperty]),
    )
  ) {
    return false;
  }

  if (metadataName === 'role' && flatEntity.isEditable === false) {
    return false;
  }

  if (
    ROLE_PERMISSION_METADATA_NAMES.includes(metadataName) &&
    isDefined(flatEntity.roleUniversalIdentifier) &&
    nonEditableRoleUniversalIdentifiers.has(flatEntity.roleUniversalIdentifier)
  ) {
    return false;
  }

  return (
    metadataName !== 'commandMenuItem' ||
    isDefined(flatEntity.frontComponentUniversalIdentifier)
  );
};
