import { useEffect, useRef } from 'react';
import { createHalftone } from './halftone';
import cloudImageUrl from './assets/onboarding-clouds.png';

export const HalftoneBackground = () => {
  const canvasReference = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasReference.current;
    if (!canvas) return;
    const image = new Image();
    let disposed = false;
    let disposeRenderer: (() => void) | undefined;

    const start = () => {
      if (disposed) return;
      disposeRenderer?.();
      disposeRenderer = undefined;
      try {
        disposeRenderer = createHalftone(canvas, image);
      } catch (error) {
        console.warn('Could not render the onboarding background.', error);
      }
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      disposeRenderer?.();
      disposeRenderer = undefined;
    };

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', start);
    image.src = cloudImageUrl;
    void image
      .decode()
      .then(start)
      .catch((error: unknown) => {
        if (image.complete && image.naturalWidth > 0) {
          start();
          return;
        }
        if (!disposed)
          console.warn('Could not load the onboarding background.', error);
      });

    return () => {
      disposed = true;
      disposeRenderer?.();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', start);
    };
  }, []);

  return (
    <canvas
      className="halftone-background"
      ref={canvasReference}
      aria-hidden="true"
    />
  );
};
