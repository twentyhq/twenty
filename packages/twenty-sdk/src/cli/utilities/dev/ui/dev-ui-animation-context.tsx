import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  SPINNER_FRAMES,
  UPLOAD_FRAMES,
} from '@/cli/utilities/dev/ui/dev-ui-constants';

type AnimationFrames = {
  spinnerFrame: string;
  uploadFrame: string;
};

const AnimationContext = createContext<AnimationFrames>({
  spinnerFrame: SPINNER_FRAMES[0],
  uploadFrame: UPLOAD_FRAMES[0],
});

const TICK_INTERVAL_MS = 120;
const UPLOAD_TICK_RATIO = Math.round(200 / TICK_INTERVAL_MS);

export const AnimationProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((previous) => previous + 1);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const spinnerFrame = SPINNER_FRAMES[tick % SPINNER_FRAMES.length];
  const uploadFrame =
    UPLOAD_FRAMES[Math.floor(tick / UPLOAD_TICK_RATIO) % UPLOAD_FRAMES.length];

  return (
    <AnimationContext.Provider value={{ spinnerFrame, uploadFrame }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimationFrames = (): AnimationFrames => {
  return useContext(AnimationContext);
};
