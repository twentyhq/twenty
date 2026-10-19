import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const registeredIconNamesState =
  createAtomState<ReadonlySet<string> | null>({
    key: 'registeredIconNamesState',
    defaultValue: null,
  });
