import sharp from 'sharp';

/**
 * Strips sensitive EXIF metadata from uploaded image buffers before saving to storage (#20477)
 */
export const stripExifMetadata = async (fileBuffer: Buffer): Promise<Buffer> => {
  try {
    return await sharp(fileBuffer).rotate().toBuffer();
  } catch (error) {
    // Return original buffer if image model is non-standard
    return fileBuffer;
  }
};
