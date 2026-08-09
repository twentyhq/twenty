import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type PersonAvatarFileHandover = {
  fileIdsToClaim: string[];
  previousOwnerPersonIds: string[];
};

const getFileIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((file) => (file as { fileId?: unknown } | null)?.fileId)
    .filter(isNonEmptyString);
};

// The merged avatar can come from a record that is being absorbed, and its file is already
// permanent. The FILES field sync only accepts freshly uploaded files as additions, so the
// survivor cannot claim that file until the previous owner has let go of it. Describe the
// move here so the merge can walk the file through that handover. Returns null when the
// survivor already owns every merged file, because a normal update covers that on its own.
export const getPersonAvatarFileHandover = ({
  mergedAvatarFile,
  recordsToMerge,
  survivorPersonId,
}: {
  mergedAvatarFile: unknown;
  recordsToMerge: ObjectRecord[];
  survivorPersonId: string;
}): PersonAvatarFileHandover | null => {
  const mergedFileIds = getFileIds(mergedAvatarFile);

  if (!Array.isArray(mergedAvatarFile) || mergedFileIds.length === 0) {
    return null;
  }

  const survivor = recordsToMerge.find(
    (record) => record.id === survivorPersonId,
  );

  if (!isDefined(survivor)) {
    return null;
  }

  const survivorFileIds = new Set(getFileIds(survivor.avatarFile));

  if (mergedFileIds.every((fileId) => survivorFileIds.has(fileId))) {
    return null;
  }

  const fileIdsToClaim = mergedFileIds.filter(
    (fileId) => !survivorFileIds.has(fileId),
  );
  const fileIdsToClaimSet = new Set(fileIdsToClaim);
  const previousOwnerPersonIds = recordsToMerge
    .filter(
      (record) =>
        record.id !== survivorPersonId &&
        getFileIds(record.avatarFile).some((fileId) =>
          fileIdsToClaimSet.has(fileId),
        ),
    )
    .map((record) => record.id);

  return {
    fileIdsToClaim,
    previousOwnerPersonIds,
  };
};
