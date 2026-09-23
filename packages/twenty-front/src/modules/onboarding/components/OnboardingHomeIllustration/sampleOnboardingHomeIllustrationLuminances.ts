import { isDefined } from 'twenty-shared/utils';

const OVERSAMPLING_PER_AXIS = 3;

export const sampleOnboardingHomeIllustrationLuminances = (
  image: HTMLImageElement,
  columns: number,
  rows: number,
): Float32Array | null => {
  const samplingCanvas = document.createElement('canvas');
  samplingCanvas.width = columns * OVERSAMPLING_PER_AXIS;
  samplingCanvas.height = rows * OVERSAMPLING_PER_AXIS;

  const samplingContext = samplingCanvas.getContext('2d', {
    willReadFrequently: true,
  });
  if (!isDefined(samplingContext)) {
    return null;
  }

  samplingContext.imageSmoothingEnabled = true;
  samplingContext.imageSmoothingQuality = 'high';
  samplingContext.drawImage(
    image,
    0,
    0,
    samplingCanvas.width,
    samplingCanvas.height,
  );

  let pixels: Uint8ClampedArray;
  try {
    pixels = samplingContext.getImageData(
      0,
      0,
      samplingCanvas.width,
      samplingCanvas.height,
    ).data;
  } catch {
    return null;
  }

  const luminances = new Float32Array(columns * rows);

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      let luminanceSum = 0;

      for (let subRow = 0; subRow < OVERSAMPLING_PER_AXIS; subRow++) {
        for (
          let subColumn = 0;
          subColumn < OVERSAMPLING_PER_AXIS;
          subColumn++
        ) {
          const pixelOffset =
            ((row * OVERSAMPLING_PER_AXIS + subRow) * samplingCanvas.width +
              column * OVERSAMPLING_PER_AXIS +
              subColumn) *
            4;
          luminanceSum +=
            (0.2126 * pixels[pixelOffset] +
              0.7152 * pixels[pixelOffset + 1] +
              0.0722 * pixels[pixelOffset + 2]) /
            255;
        }
      }

      luminances[row * columns + column] =
        luminanceSum / (OVERSAMPLING_PER_AXIS * OVERSAMPLING_PER_AXIS);
    }
  }

  return luminances;
};
