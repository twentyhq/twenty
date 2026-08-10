import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Pathname the search page collapsed back to. The side panel it reopens there
// belongs to that route, so the route change must not close it.
export const searchSidePanelHandoffPathnameState = createAtomState<
  string | null
>({
  key: 'search/searchSidePanelHandoffPathnameState',
  defaultValue: null,
});
