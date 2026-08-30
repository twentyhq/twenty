export const getViewIdFromPath = (path: string) => {
  const [, search] = path.split('#')[0].split('?');

  return new URLSearchParams(search ?? '').get('viewId');
};
