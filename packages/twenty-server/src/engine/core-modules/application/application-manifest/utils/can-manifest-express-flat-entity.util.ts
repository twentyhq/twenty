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

type ProbedPropertyName =
  | (typeof WORKSPACE_BOUND_PROPERTIES)[number]
  | 'frontComponentUniversalIdentifier'
  | 'workflowId'
  | 'agentId';

type ProbedFlatEntity = {
  universalIdentifier: string;
  isEditable?: boolean;
} & Partial<Record<ProbedPropertyName, string | null>>;

export const canManifestExpressFlatEntity = ({
  metadataName,
  flatEntity,
  parentFlatRole,
}: {
  metadataName: AllMetadataName;
  flatEntity: ProbedFlatEntity;
  parentFlatRole?: ProbedFlatEntity;
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
    metadataName === 'navigationMenuItem' &&
    (isDefined(flatEntity.workflowId) || isDefined(flatEntity.agentId))
  ) {
    return false;
  }

  // What a role holds is only in a manifest if the role itself is
  if (
    isDefined(parentFlatRole) &&
    !canManifestExpressFlatEntity({
      metadataName: 'role',
      flatEntity: parentFlatRole,
    })
  ) {
    return false;
  }

  return (
    metadataName !== 'commandMenuItem' ||
    isDefined(flatEntity.frontComponentUniversalIdentifier)
  );
};
