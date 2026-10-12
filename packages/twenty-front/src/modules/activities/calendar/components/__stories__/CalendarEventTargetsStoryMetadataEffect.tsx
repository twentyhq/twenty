import { useLoadMockedMetadata } from '~/testing/hooks/useLoadMockedMetadata';
import { type PreloadedMockedMetadata } from '~/testing/utils/preloadMockedMetadata';
import { useEffect } from 'react';

type CalendarEventTargetsStoryMetadataEffectProps = {
  metadata: PreloadedMockedMetadata;
};

export const CalendarEventTargetsStoryMetadataEffect = ({
  metadata,
}: CalendarEventTargetsStoryMetadataEffectProps) => {
  const { applyMockedMetadata } = useLoadMockedMetadata();

  useEffect(() => {
    applyMockedMetadata(metadata);
  }, [applyMockedMetadata, metadata]);

  return null;
};
