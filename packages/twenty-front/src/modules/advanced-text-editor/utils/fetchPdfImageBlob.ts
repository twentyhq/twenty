import { convertImageBlobToPngBlob } from '@/advanced-text-editor/utils/convertImageBlobToPngBlob';

// react-pdf only decodes PNG and JPEG.
const PDF_SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

export const fetchPdfImageBlob = async (
  url: string,
): Promise<Blob | undefined> => {
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });

    if (!response.ok) {
      return undefined;
    }

    const imageBlob = await response.blob();

    return PDF_SUPPORTED_IMAGE_TYPES.includes(imageBlob.type)
      ? imageBlob
      : await convertImageBlobToPngBlob(imageBlob);
  } catch {
    return undefined;
  }
};
