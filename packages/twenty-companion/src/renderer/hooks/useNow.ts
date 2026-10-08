import { useEffect, useState } from 'react';

export const useNow = (intervalMilliseconds: number | null) => {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (intervalMilliseconds === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMilliseconds);
    return () => clearInterval(timer);
  }, [intervalMilliseconds]);
  return now;
};
