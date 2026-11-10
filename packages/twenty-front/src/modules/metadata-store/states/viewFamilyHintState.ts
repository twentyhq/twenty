import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const viewFamilyHintState = createAtomState<string | undefined>({
  key: 'viewFamilyHintState',
  defaultValue: undefined,
});
