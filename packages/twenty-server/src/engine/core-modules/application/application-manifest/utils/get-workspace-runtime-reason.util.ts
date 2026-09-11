import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export const getWorkspaceRuntimeReason = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity:
    | MetadataFlatEntity<AllMetadataName>
    | MetadataUniversalFlatEntity<AllMetadataName>;
}): string | undefined => {
  switch (metadataName) {
    case 'webhook':
      return 'runtime configuration';
    case 'roleTarget':
      return ('userWorkspaceId' in flatEntity &&
        isDefined(flatEntity.userWorkspaceId)) ||
        ('apiKeyId' in flatEntity && isDefined(flatEntity.apiKeyId))
        ? 'member or API key role assignment'
        : undefined;
    case 'commandMenuItem':
      return 'workflowVersionId' in flatEntity &&
        isDefined(flatEntity.workflowVersionId)
        ? 'workflow trigger command'
        : undefined;
    case 'navigationMenuItem':
      if (
        'userWorkspaceId' in flatEntity &&
        isDefined(flatEntity.userWorkspaceId)
      ) {
        return 'personal navigation item';
      }

      return 'targetRecordId' in flatEntity &&
        isDefined(flatEntity.targetRecordId)
        ? 'navigation item pinned to a record'
        : undefined;
    default:
      return undefined;
  }
};
