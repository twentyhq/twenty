import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type HeadlessFrontComponentMountContext =
  | {
      recordId: string;
      objectNameSingular: string;
    }
  | undefined;

export const mountedHeadlessFrontComponentMapsState = createAtomState<
  Map<string, HeadlessFrontComponentMountContext>
>({
  key: 'mountedHeadlessFrontComponentMapsState',
  defaultValue: new Map(),
});
