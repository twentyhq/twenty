export function getImageAbsoluteURI(imageRelativePath?: string | null) {
  return imageRelativePath
    ? `${process.env.REACT_APP_FILES_URL}/${imageRelativePath}`
    : null;
}
