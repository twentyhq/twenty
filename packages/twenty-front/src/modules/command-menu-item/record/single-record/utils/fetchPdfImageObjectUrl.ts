import { convertImageBlobToPngBlob } from '@/command-menu-item/record/single-record/utils/convertImageBlobToPngBlob';
import { isDefined } from 'twenty-shared/utils';

// react-pdf only decodes PNG and JPEG.
const PDF_SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

export const fetchPdfImageObjectUrl = async (
  url: string,
): Promise<string | undefined> => {
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });

    if (!response.ok) {
      return undefined;
    }

    const imageBlob = await response.blob();

    if (PDF_SUPPORTED_IMAGE_TYPES.includes(imageBlob.type)) {
      return URL.createObjectURL(imageBlob);
    }

    const pngBlob = await convertImageBlobToPngBlob(imageBlob);

    return isDefined(pngBlob) ? URL.createObjectURL(pngBlob) : undefined;
  } catch {
    return undefined;
  }
};
