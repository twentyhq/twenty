export const getFileNameAndExtension = (filenameWithExtension: string) => {
  const lastDotIndex = filenameWithExtension.lastIndexOf('.');

  return {
    name: filenameWithExtension.substring(0, lastDotIndex),
    extension: filenameWithExtension.substring(lastDotIndex),
  };
};
