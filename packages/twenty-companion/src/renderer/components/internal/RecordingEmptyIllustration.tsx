import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import { useThemeColorScheme } from '@ui/theme-constants';

import styles from './RecordingEmptyIllustration.module.scss';

const PARALLAX_OFFSET_IN_PX = 2;

export const RecordingEmptyIllustration = () => {
  const colorScheme = useThemeColorScheme();
  const movingImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const movingImage = movingImageRef.current;
    if (movingImage === null) {
      return;
    }

    const setParallax = ({
      offsetX,
      offsetY,
    }: {
      offsetX: number;
      offsetY: number;
    }) => {
      movingImage.style.setProperty('--parallax-x', `${offsetX}px`);
      movingImage.style.setProperty('--parallax-y', `${offsetY}px`);
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        'touches' in event ? event.touches[0].clientY : event.clientY;

      setParallax({
        offsetX:
          (clientX / window.innerWidth) * 2 * PARALLAX_OFFSET_IN_PX -
          PARALLAX_OFFSET_IN_PX,
        offsetY:
          (clientY / window.innerHeight) * 2 * PARALLAX_OFFSET_IN_PX -
          PARALLAX_OFFSET_IN_PX,
      });
    };

    const handleLeave = () => {
      setParallax({ offsetX: 0, offsetY: 0 });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div className={styles.container}>
      <img
        src={`./images/placeholders/${colorScheme === 'dark' ? 'dark-background' : 'background'}/no_call_recording_bg.png`}
        alt=""
        className={clsx(styles.backgroundImage)}
      />
      <img
        ref={movingImageRef}
        src={`./images/placeholders/${colorScheme === 'dark' ? 'dark-moving-image' : 'moving-image'}/no_call_recording.png`}
        alt=""
        className={styles.movingImage}
      />
    </div>
  );
};
