import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type HeadlessFrontComponentMountContext = {
  commandMenuItemId: string;
  recordId?: string;
  objectNameSingular?: string;
};

export const mountedHeadlessFrontComponentMapsState = createAtomState<
  Map<string, HeadlessFrontComponentMountContext>
>({
  key: 'mountedHeadlessFrontComponentMapsState',
  defaultValue: new Map(),
});
