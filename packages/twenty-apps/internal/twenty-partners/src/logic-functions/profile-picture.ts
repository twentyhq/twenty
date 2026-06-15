// A FILES field reads back as an array of file items, each exposing a signed
// `url`. We surface the first file's url, mapped into the legacy { primaryLinkUrl }
// shape the website partner directory already consumes — so switching
// profilePicture from LINKS to FILES stays contained to the app.
type FileItemRead = { url?: string | null } | null | undefined;

export function firstFileUrl(
  files: ReadonlyArray<FileItemRead> | null | undefined,
): string | null {
  if (!files) return null;
  for (const file of files) {
    if (file?.url) return file.url;
  }
  return null;
}
