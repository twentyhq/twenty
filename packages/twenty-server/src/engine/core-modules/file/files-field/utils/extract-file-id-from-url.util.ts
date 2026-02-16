import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const extractFileIdFromUrl = (url: string): string | null => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const pathname = parsedUrl.pathname;
  const isLinkExternal = !pathname.startsWith('/files-field/');

  if (isLinkExternal) {
    return null;
  }

  const fileId = pathname.match(/files-field\/([^/]+)/)?.[1];

  return isDefined(fileId) && isValidUuid(fileId) ? fileId : null;
};
