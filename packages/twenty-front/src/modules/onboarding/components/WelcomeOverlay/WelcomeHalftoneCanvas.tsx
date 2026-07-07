import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

import { WELCOME_HALFTONE_DASHES } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneDots';
import { createWelcomeHalftoneRenderer } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneRenderer';

import './welcomeHalftone.css';

const StyledCanvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`;

type WelcomeHalftoneCanvasProps = {
  isLeaving: boolean;
};

export const WelcomeHalftoneCanvas = ({
  isLeaving,
}: WelcomeHalftoneCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<ReturnType<
    typeof createWelcomeHalftoneRenderer
  > | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    let context: CanvasRenderingContext2D | null = null;
    try {
      context = canvas.getContext('2d');
    } catch {
      context = null;
    }
    if (context === null) {
      return;
    }

    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const styles = getComputedStyle(canvas);
    const color = styles.getPropertyValue('--welcome-dot-color').trim();
    const highlightColor =
      styles.getPropertyValue('--welcome-dot-highlight').trim() || color;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const syncSize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      return { width, height };
    };

    const { width, height } = syncSize();
    const createdRenderer = createWelcomeHalftoneRenderer({
      context,
      dashes: WELCOME_HALFTONE_DASHES,
      width,
      height,
      devicePixelRatio,
      color,
      highlightColor,
      reducedMotion,
    });
    setRenderer(createdRenderer);

    const handleResize = () => {
      const next = syncSize();
      createdRenderer.resize(next.width, next.height, devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      createdRenderer.destroy();
    };
  }, []);

  useEffect(() => {
    if (isLeaving) {
      renderer?.leave();
    }
  }, [isLeaving, renderer]);

  return <StyledCanvas ref={canvasRef} aria-hidden="true" />;
};
