import { type ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { useCallback, useState } from 'react';

export const useDropdownContextCurrentContentId = <
  TContentId extends ObjectOptionsContentId,
>() => {
  const [currentContentId, setCurrentContentId] = useState<TContentId | null>(
    null,
  );

  const [previousContentId, setPreviousContentId] = useState<TContentId | null>(
    null,
  );

  const handleContentChange = useCallback(
    (key: TContentId) => {
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
