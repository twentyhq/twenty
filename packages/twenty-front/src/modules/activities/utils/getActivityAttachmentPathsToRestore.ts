import { type Attachment } from '@/activities/files/types/Attachment';
import { compareUrls } from '@/activities/utils/compareUrls';
import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';
import { getAttachmentUrl } from '@/activities/utils/getAttachmentUrl';

export const getActivityAttachmentPathsToRestore = (
  newActivityBody: string,
  oldActivityAttachments: Attachment[],
  isFilesFieldMigrated: boolean,
) => {
  const newActivityAttachmentPaths =
    getActivityAttachmentPathsAndName(newActivityBody);

  const pathsToRestore = newActivityAttachmentPaths
    .filter(
      (newActivity) =>
        !oldActivityAttachments.some((attachment) =>
          compareUrls(
            newActivity.path,
            getAttachmentUrl({ attachment, isFilesFieldMigrated }),
          ),
        ),
    )
    .map((activity) => activity.path);

  return pathsToRestore;
};
