// The hash closes a url, so it comes off before the search does.
export const getPathnameFromPath = (path: string) =>
  path.split('#')[0].split('?')[0];
