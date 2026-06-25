import { type Response } from 'express';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';

// Picture files are content-addressed by an immutable file id: changing an
// avatar or logo mints a new file id (and therefore a new URL), so the bytes
// served at any given URL never change. Letting the browser cache them avoids
// re-fetching the same avatar dozens of times in parallel when it renders many
// times on one page (e.g. a record list where one member owns many rows) — the
// uncached bursts were the source of the intermittent file-stream errors.
// Scoped to picture folders so non-image files (attachments, tarballs, source,
// ...) are never cached past a permission change.
const CACHEABLE_PICTURE_FILE_FOLDERS: FileFolder[] = [
  FileFolder.CorePicture,
  FileFolder.ProfilePicture,
  FileFolder.WorkspaceLogo,
  FileFolder.PersonPicture,
];

// Avatars/logos are served behind a per-workspace file token, so keep shared
// caches out (private). The content is immutable per the id, so no revalidation.
const PICTURE_CACHE_CONTROL = 'private, max-age=86400, immutable';

export const setFileResponseHeaders = (
  res: Response,
  mimeType: string,
  fileFolder?: FileFolder,
) => {
  const contentType = mimeType || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', getContentDisposition(contentType));

  if (
    isDefined(fileFolder) &&
    CACHEABLE_PICTURE_FILE_FOLDERS.includes(fileFolder)
  ) {
    res.setHeader('Cache-Control', PICTURE_CACHE_CONTROL);
  }
};
