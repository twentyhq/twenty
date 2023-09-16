export const getImageAbsoluteURIOrBase64 = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('data:')) {
    return imageUrl;
  }

  if (imageUrl?.startsWith('https:')) {
    return imageUrl;
  }

  const serverFilesUrl =
    process.env.REACT_APP_SERVER_FILES_URL ??
    process.env.REACT_APP_SERVER_BASE_URL + '/files';

  return `${serverFilesUrl}/${imageUrl}`;
};
