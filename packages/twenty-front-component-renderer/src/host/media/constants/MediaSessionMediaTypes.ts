import { type MediaSessionMediaType } from '@/types/MediaSession';

export const MEDIA_SESSION_MEDIA_TYPES = [
  'audio',
  'video',
] as const satisfies readonly MediaSessionMediaType[];
