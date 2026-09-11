import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const METADATA_NAMES_WITHOUT_MANIFEST_REPRESENTATION: AllMetadataName[] = [
  'webhook',
];

const WORKSPACE_BOUND_PROPERTIES = [
  'userWorkspaceId',
  'apiKeyId',
  'workflowVersionId',
  'targetRecordId',
] as const;

type ProbedPropertyName =
  | (typeof WORKSPACE_BOUND_PROPERTIES)[number]
  | 'frontComponentUniversalIdentifier';

type ProbedFlatEntity = {
  universalIdentifier: string;
} & Partial<Record<ProbedPropertyName, string | null>>;

export const canManifestExpressFlatEntity = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: ProbedFlatEntity;
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

  return (
    metadataName !== 'commandMenuItem' ||
    isDefined(flatEntity.frontComponentUniversalIdentifier)
  );
};
