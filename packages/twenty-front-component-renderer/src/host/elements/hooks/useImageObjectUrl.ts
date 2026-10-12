import { useLayoutEffect, useState } from 'react';

export const useImageObjectUrl = (blob: unknown): string | undefined => {
  const [source, setSource] = useState<{ blob: Blob; url: string } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!(blob instanceof Blob)) {
      setSource(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setSource({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return source?.blob === blob ? source?.url : undefined;
};
