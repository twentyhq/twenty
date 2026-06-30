import { type ApiConfig } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const apiConfigState = createAtomState<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
