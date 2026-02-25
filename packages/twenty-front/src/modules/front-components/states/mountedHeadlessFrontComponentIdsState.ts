import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type HeadlessFrontComponentMountContext = {
  recordId?: string;
  objectNameSingular?: string;
};

export const mountedHeadlessFrontComponentIdsState = createAtomState<
  Map<string, HeadlessFrontComponentMountContext>
>({
  key: 'mountedHeadlessFrontComponentIdsState',
  defaultValue: new Map(),
});
