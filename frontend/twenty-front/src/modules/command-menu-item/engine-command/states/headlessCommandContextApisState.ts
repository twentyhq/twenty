import { type HeadlessCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const headlessCommandContextApisState = createAtomState<
  Map<string, HeadlessCommandContextApi>
>({
  key: 'headlessCommandContextApisState',
  defaultValue: new Map(),
});
