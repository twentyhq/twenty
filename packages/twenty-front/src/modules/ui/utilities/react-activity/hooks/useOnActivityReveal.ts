import { useEffect, useState } from 'react';

// Effects are destroyed when an ancestor <Activity> hides and re-created on
// reveal, while this useState box survives, so a second effect mount can only
// be a reveal (or a StrictMode dev remount, which costs one redundant call).
export const useOnActivityReveal = (onReveal: () => void) => {
  const [activityLifecycle] = useState(() => ({
    hasMountedEffectsBefore: false,
    onReveal,
  }));

  useEffect(() => {
    activityLifecycle.onReveal = onReveal;
  }, [activityLifecycle, onReveal]);

  useEffect(() => {
    if (activityLifecycle.hasMountedEffectsBefore) {
      activityLifecycle.onReveal();
      return;
    }

    activityLifecycle.hasMountedEffectsBefore = true;
  }, [activityLifecycle]);
};
