import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ClientAiModelTierConfig } from '~/generated-metadata/graphql';

export const aiModelTiersState = createAtomState<ClientAiModelTierConfig[]>({
  key: 'aiModelTiersState',
  defaultValue: [],
});
