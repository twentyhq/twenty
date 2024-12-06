import { useCallback, useState } from 'react';

export const useCurrentContentId = <T>() => {
  const [currentContentId, setCurrentContentId] = useState<T | null>(null);

  const handleContentChange = useCallback((key: T) => {
    setCurrentContentId(key);
  }, []);

  const handleResetContent = useCallback(() => {
    setCurrentContentId(null);
  }, []);

  return {
    currentContentId,
    handleContentChange,
    handleResetContent,
  };
};
