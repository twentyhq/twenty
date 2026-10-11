export const waitForAnimationFrames = async (
  frameCount: number,
): Promise<void> => {
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};
