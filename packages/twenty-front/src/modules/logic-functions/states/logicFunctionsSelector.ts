import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type LogicFunction } from '@/logic-functions/types/LogicFunction';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const logicFunctionsSelector = createAtomSelector<LogicFunction[]>({
  key: 'logicFunctionsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'logicFunctions');

    return storeItem.current as LogicFunction[];
  },
});
