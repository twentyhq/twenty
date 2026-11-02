import { type MediaAccessSession } from '@/media-access/types/MediaAccessSession';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const mediaAccessSessionsState = createAtomState<MediaAccessSession[]>({
  key: 'mediaAccessSessionsState',
  defaultValue: [],
});
