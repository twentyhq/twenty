import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastVisitedUrlByNavigationMenuTabKeyState = createAtomState<
  Record<string, string>
>({
  key: 'lastVisitedUrlByNavigationMenuTabKeyState',
  defaultValue: {},
});
