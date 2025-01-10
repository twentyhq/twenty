import { useCallback, useState } from 'react';

export const useCurrentContentId = <T>() => {
  const [currentContentId, setCurrentContentId] = useState<T | null>(null);

  const [previousContentId, setPreviousContentId] = useState<T | null>(null);

  const handleContentChange = useCallback(
    (key: T) => {
      setPreviousContentId(currentContentId);
      setCurrentContentId(key);
    },
    [currentContentId],
  );

  const handleResetContent = useCallback(() => {
    setPreviousContentId(null);
    setCurrentContentId(null);
  }, []);

  return {
    previousContentId,
    currentContentId,
    handleContentChange,
    handleResetContent,
  };
};
