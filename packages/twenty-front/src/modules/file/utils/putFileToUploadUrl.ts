export const putFileToUploadUrl = async ({
  file,
  uploadUrl,
  contentType,
  signal,
}: {
  file: File;
  uploadUrl: string;
  contentType: string;
  signal?: AbortSignal;
}): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
    credentials: 'omit',
    signal,
  });

  if (!response.ok) {
    throw new Error(`File upload failed with status ${response.status}`);
  }
};
