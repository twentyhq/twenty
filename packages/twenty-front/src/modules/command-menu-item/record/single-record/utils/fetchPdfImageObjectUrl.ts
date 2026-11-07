const PDF_SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

// An image the PDF cannot draw is left out instead of failing the whole export.
export const fetchPdfImageObjectUrl = async (
  url: string,
): Promise<string | undefined> => {
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });

    if (!response.ok) {
      return undefined;
    }

    const blob = await response.blob();

    return PDF_SUPPORTED_IMAGE_TYPES.includes(blob.type)
      ? URL.createObjectURL(blob)
      : undefined;
  } catch {
    return undefined;
  }
};
