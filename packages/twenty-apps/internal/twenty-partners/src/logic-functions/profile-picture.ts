// A FILES field reads back as an array of file items, each exposing a signed
// `url`. We surface the first file's url, mapped into the legacy { primaryLinkUrl }
// shape the website partner directory already consumes.
type FileItemRead = { url?: string | null } | null | undefined;

export function firstFileUrl(
  files: ReadonlyArray<FileItemRead> | null | undefined,
): string | null {
  return files?.find((file) => file?.url)?.url ?? null;
}

// Picture has two sources: the new uploaded file (profilePictureFile, FILES) and
// the legacy URL (profilePicture, LINKS) that pre-FILES partners still carry.
// Prefer an uploaded file, fall back to the legacy URL.
export function resolvePartnerPictureUrl(
  files: ReadonlyArray<FileItemRead> | null | undefined,
  legacyLinkUrl: string | null | undefined,
): string | null {
  return firstFileUrl(files) ?? legacyLinkUrl ?? null;
}
