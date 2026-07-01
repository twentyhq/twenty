import { type Response } from 'express';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';

// CorePicture (avatars, logos) is content-addressed by an immutable file id, so
// the bytes at a given URL never change and the browser can cache them hard —
// sparing the dozens of parallel re-fetches that fire when one avatar renders
// many times on a page. Scoped to this folder so mutable files are not cached
// past a permission change; the other picture folders are deprecated and no
// longer served by this endpoint (see SUPPORTED_FILE_FOLDERS).
const CACHEABLE_PICTURE_FILE_FOLDERS: FileFolder[] = [FileFolder.CorePicture];

// `private`: responses are gated by a per-workspace file token, keep them out of
// shared caches. `immutable`: the content-addressed id means no revalidation.
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
