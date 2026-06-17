export const getFileNameAndExtension = (filenameWithExtension: string) => {
  const lastDotIndex = filenameWithExtension.lastIndexOf('.');

  // Without a dot, substring(0, -1) and substring(-1) would put the whole
  // filename into the extension, so keep it as the name with an empty extension.
  if (lastDotIndex === -1) {
    return {
      name: filenameWithExtension,
      extension: '',
    };
  }

  return {
    name: filenameWithExtension.substring(0, lastDotIndex),
    extension: filenameWithExtension.substring(lastDotIndex),
  };
};
