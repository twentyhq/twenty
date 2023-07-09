export function getImageAbsoluteURIOrBase64(imageUrl?: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('data:')) {
    return imageUrl;
  }
  return `${process.env.REACT_APP_FILES_URL}/${imageUrl}`;
}
