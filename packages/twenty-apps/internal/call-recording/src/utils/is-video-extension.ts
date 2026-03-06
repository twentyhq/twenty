import { VIDEO_EXTENSIONS } from 'src/constants/video-extensions';

export const isVideoExtension = (extension: string): boolean =>
  VIDEO_EXTENSIONS.includes(extension.toLowerCase() as (typeof VIDEO_EXTENSIONS)[number]);
