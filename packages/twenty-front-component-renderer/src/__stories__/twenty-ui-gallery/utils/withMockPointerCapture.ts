import { spyOn } from 'storybook/test';

type WithMockPointerCaptureArgs = {
  handles: HTMLElement[];
  run: () => Promise<void>;
};

export const withMockPointerCapture = async ({
  handles,
  run,
}: WithMockPointerCaptureArgs) => {
  const restoreCaptureMocks = handles.map((handle) => {
    const capturedPointers = new Set<number>();
    const setPointerCapture = spyOn(
      handle,
      'setPointerCapture',
    ).mockImplementation((pointerId) => {
      capturedPointers.add(pointerId);
    });
    const hasPointerCapture = spyOn(
      handle,
      'hasPointerCapture',
    ).mockImplementation((pointerId) => capturedPointers.has(pointerId));
    const releasePointerCapture = spyOn(
      handle,
      'releasePointerCapture',
    ).mockImplementation((pointerId) => {
      capturedPointers.delete(pointerId);
    });

    return () => {
      setPointerCapture.mockRestore();
      hasPointerCapture.mockRestore();
      releasePointerCapture.mockRestore();
    };
  });

  try {
    await run();
  } finally {
    for (const restoreCaptureMock of restoreCaptureMocks) {
      restoreCaptureMock();
    }
  }
};
