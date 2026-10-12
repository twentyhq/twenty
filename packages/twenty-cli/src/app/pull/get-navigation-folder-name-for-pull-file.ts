import { isUsableFileNameSegment } from '@/app/pull/pull-file-base-name';
import { type Manifest } from 'twenty-shared/application';

export const getNavigationFolderNameForPullFile = ({
  folderUniversalIdentifier,
  manifest,
}: {
  folderUniversalIdentifier: string;
  manifest: Manifest;
}): string | null => {
  const folderName = manifest.navigationMenuItems?.find(
    (candidate) => candidate.universalIdentifier === folderUniversalIdentifier,
  )?.name;

  return isUsableFileNameSegment(folderName) ? folderName : null;
};
