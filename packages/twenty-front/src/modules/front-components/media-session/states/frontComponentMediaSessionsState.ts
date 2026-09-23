import { type FrontComponentMediaSessionStatus } from '@/front-components/media-session/types/FrontComponentMediaSessionStatus';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const frontComponentMediaSessionsState = createAtomState<
  FrontComponentMediaSessionStatus[]
>({
  key: 'frontComponentMediaSessionsState',
  defaultValue: [],
});
