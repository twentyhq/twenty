export type OnboardingConstructionSiteVector = readonly [
  number,
  number,
  number,
];

export const createPerspectiveMatrix = (
  verticalFieldOfViewRadians: number,
  aspectRatio: number,
  near: number,
  far: number,
  verticalShift = 0,
) => {
  const focalLength = 1 / Math.tan(verticalFieldOfViewRadians / 2);
  const depthRange = 1 / (near - far);

  return new Float32Array([
    focalLength / aspectRatio,
    0,
    0,
    0,
    0,
    focalLength,
    0,
    0,
    0,
    -verticalShift,
    (far + near) * depthRange,
    -1,
    0,
    0,
    2 * far * near * depthRange,
    0,
  ]);
};

export const createLookAtMatrix = (
  eye: OnboardingConstructionSiteVector,
  target: OnboardingConstructionSiteVector,
) => {
  const forwardX = eye[0] - target[0];
  const forwardY = eye[1] - target[1];
  const forwardZ = eye[2] - target[2];
  const forwardLength = Math.hypot(forwardX, forwardY, forwardZ) || 1;
  const zAxisX = forwardX / forwardLength;
  const zAxisY = forwardY / forwardLength;
  const zAxisZ = forwardZ / forwardLength;

  const rightX = zAxisZ;
  const rightZ = -zAxisX;
  const rightLength = Math.hypot(rightX, rightZ) || 1;
  const xAxisX = rightX / rightLength;
  const xAxisZ = rightZ / rightLength;

  const yAxisX = zAxisY * xAxisZ;
  const yAxisY = zAxisZ * xAxisX - zAxisX * xAxisZ;
  const yAxisZ = -zAxisY * xAxisX;

  return new Float32Array([
    xAxisX,
    yAxisX,
    zAxisX,
    0,
    0,
    yAxisY,
    zAxisY,
    0,
    xAxisZ,
    yAxisZ,
    zAxisZ,
    0,
    -(xAxisX * eye[0] + xAxisZ * eye[2]),
    -(yAxisX * eye[0] + yAxisY * eye[1] + yAxisZ * eye[2]),
    -(zAxisX * eye[0] + zAxisY * eye[1] + zAxisZ * eye[2]),
    1,
  ]);
};

export const multiplyMatrices = (left: Float32Array, right: Float32Array) => {
  const product = new Float32Array(16);

  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let index = 0; index < 4; index++) {
        sum += left[index * 4 + row] * right[column * 4 + index];
      }
      product[column * 4 + row] = sum;
    }
  }

  return product;
};

export const writeTransformMatrix = (
  target: Float32Array,
  offset: number,
  position: OnboardingConstructionSiteVector,
  rotation: OnboardingConstructionSiteVector,
  scale: OnboardingConstructionSiteVector,
) => {
  const cosineX = Math.cos(rotation[0]);
  const sineX = Math.sin(rotation[0]);
  const cosineY = Math.cos(rotation[1]);
  const sineY = Math.sin(rotation[1]);
  const cosineZ = Math.cos(rotation[2]);
  const sineZ = Math.sin(rotation[2]);

  const m00 = cosineY * cosineZ + sineY * sineX * sineZ;
  const m01 = cosineX * sineZ;
  const m02 = -sineY * cosineZ + cosineY * sineX * sineZ;
  const m10 = -cosineY * sineZ + sineY * sineX * cosineZ;
  const m11 = cosineX * cosineZ;
  const m12 = sineY * sineZ + cosineY * sineX * cosineZ;
  const m20 = sineY * cosineX;
  const m21 = -sineX;
  const m22 = cosineY * cosineX;

  target[offset] = m00 * scale[0];
  target[offset + 1] = m01 * scale[0];
  target[offset + 2] = m02 * scale[0];
  target[offset + 3] = 0;
  target[offset + 4] = m10 * scale[1];
  target[offset + 5] = m11 * scale[1];
  target[offset + 6] = m12 * scale[1];
  target[offset + 7] = 0;
  target[offset + 8] = m20 * scale[2];
  target[offset + 9] = m21 * scale[2];
  target[offset + 10] = m22 * scale[2];
  target[offset + 11] = 0;
  target[offset + 12] = position[0];
  target[offset + 13] = position[1];
  target[offset + 14] = position[2];
  target[offset + 15] = 1;
};
