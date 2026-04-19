import { type FileFolder } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const extractFileIdFromUrl = (
  Url: string,
  fileFolder: FileFolder,
): string | null => {
  let parsedUrl: Url;

  try {
    parsedUrl = new Url(Url);
  } catch {
    return null;
  }

  const pathname = parsedUrl.pathname;
  const isLinkExternal = !pathname.startsWith(`/file/${fileFolder}/`);

  if (isLinkExternal) {
    return null;
  }

  const fileId = pathname.match(`/${fileFolder}/([^/]+)`)?.[1];

  return isDefined(fileId) && isValidUuid(fileId) ? fileId : null;
};
