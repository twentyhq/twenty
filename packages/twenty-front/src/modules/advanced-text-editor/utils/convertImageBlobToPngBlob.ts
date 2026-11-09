import { isDefined } from 'twenty-shared/utils';

const PNG_MIME_TYPE = 'image/png';

export const convertImageBlobToPngBlob = async (
  imageBlob: Blob,
): Promise<Blob | undefined> => {
  const imageObjectUrl = URL.createObjectURL(imageBlob);

  try {
    const image = new Image();

    image.src = imageObjectUrl;
    await image.decode();

    const canvas = document.createElement('canvas');

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');

    if (!isDefined(context) || canvas.width === 0 || canvas.height === 0) {
      return undefined;
    }

    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, PNG_MIME_TYPE),
    );

    return pngBlob ?? undefined;
  } catch {
    return undefined;
  } finally {
    URL.revokeObjectURL(imageObjectUrl);
  }
};
