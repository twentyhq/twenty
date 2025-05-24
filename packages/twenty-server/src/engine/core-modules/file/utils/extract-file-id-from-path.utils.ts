export const extractFileIdFromPath = (path: string) => {
  return path.split('/').reverse()[0];
};
