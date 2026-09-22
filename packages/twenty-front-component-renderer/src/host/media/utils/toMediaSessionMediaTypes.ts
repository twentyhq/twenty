import { type MediaSessionMediaType } from '@/types/MediaSession';

export const toMediaSessionMediaTypes = ({
  audio,
  video,
}: {
  audio: boolean;
  video: boolean;
}): MediaSessionMediaType[] => [
  ...(audio ? (['audio'] as const) : []),
  ...(video ? (['video'] as const) : []),
];
