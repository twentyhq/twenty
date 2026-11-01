import { type MediaAccessOwner } from '@/media-access/types/MediaAccessOwner';

export const getMediaAccessOwnerId = ({
  type,
  id,
}: Pick<MediaAccessOwner, 'type' | 'id'>) => `${type}:${id}`;
