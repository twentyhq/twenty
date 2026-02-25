import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const openAPIReferenceState = createAtomState<any>({
  key: 'OpenAPIReference',
  defaultValue: null,
});
