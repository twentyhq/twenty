import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { recordPermissionsFamilySelector } from '@/object-record/record-sharing/states/recordPermissionsFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

export const agentChatThreadPermissionsFamilySelector =
  createAtomFamilySelector<RecordPermissionsDto | undefined, string>({
    key: 'agentChatThreadPermissionsFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const objectMetadata = get(
          objectMetadataItemByUniversalIdentifierFamilySelector,
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        );
        return isDefined(objectMetadata)
          ? get(recordPermissionsFamilySelector, {
              objectMetadataId: objectMetadata.id,
              recordId: threadId,
            })
          : undefined;
      },
  });
