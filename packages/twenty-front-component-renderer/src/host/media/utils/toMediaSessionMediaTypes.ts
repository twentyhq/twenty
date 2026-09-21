import { type MediaSessionMediaType } from '@/types/MediaSession';

export const toMediaSessionMediaTypes = ({
  audio,
  video,
}: {
  audio: unknown;
  video: unknown;
}): MediaSessionMediaType[] => [
  ...(audio ? (['audio'] as const) : []),
  ...(video ? (['video'] as const) : []),
];
