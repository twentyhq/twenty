import { spyOn } from 'storybook/test';

type WithMockPointerCaptureArgs = {
  handles: HTMLElement[];
  run: () => Promise<void>;
};

export const withMockPointerCapture = async ({
  handles,
  run,
}: WithMockPointerCaptureArgs) => {
  const captureMocks: { mockRestore: () => void }[] = [];

  try {
    for (const handle of handles) {
      const capturedPointers = new Set<number>();

      captureMocks.push(
        spyOn(handle, 'setPointerCapture').mockImplementation((pointerId) => {
          capturedPointers.add(pointerId);
        }),
      );
      captureMocks.push(
        spyOn(handle, 'hasPointerCapture').mockImplementation((pointerId) =>
          capturedPointers.has(pointerId),
        ),
      );
      captureMocks.push(
        spyOn(handle, 'releasePointerCapture').mockImplementation(
          (pointerId) => {
            capturedPointers.delete(pointerId);
          },
        ),
      );
    }

    await run();
  } finally {
    for (const captureMock of captureMocks) {
      captureMock.mockRestore();
    }
  }
};
