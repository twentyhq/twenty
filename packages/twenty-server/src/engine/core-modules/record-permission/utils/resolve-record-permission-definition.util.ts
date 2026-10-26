import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';
import {
  isDefined,
  resolveObjectRecordPermissionPolicy,
} from 'twenty-shared/utils';

import { type RecordPermissionMetadata } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';

export const resolveRecordPermissionDefinition = (
  definition: RecordPermissionPolicyDefinition,
  metadata: RecordPermissionMetadata,
): RecordPermissionPolicyDefinition => ({
  version: 1,
  objects: Object.values(metadata.flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((object) => object.nameSingular !== 'recordShare')
    .map((object) =>
      resolveObjectRecordPermissionPolicy(
        definition,
        object.universalIdentifier,
      ),
    ),
});
