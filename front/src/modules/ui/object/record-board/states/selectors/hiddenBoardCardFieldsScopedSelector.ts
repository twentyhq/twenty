import { selectorFamily } from 'recoil';

import { availableBoardCardFieldsScopedState } from '../availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedFamilyState } from '../boardCardFieldsScopedFamilyState';

export const hiddenBoardCardFieldsScopedSelector = selectorFamily({
  key: 'hiddenBoardCardFieldsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const fields = get(boardCardFieldsScopedFamilyState(scopeId));
      const fieldKeys = fields.map(({ fieldMetadataId }) => fieldMetadataId);
      const otherAvailableKeys = get(
        availableBoardCardFieldsScopedState({ scopeId }),
      ).filter(({ fieldMetadataId }) => !fieldKeys.includes(fieldMetadataId));

      return [
        ...fields.filter((field) => !field.isVisible),
        ...otherAvailableKeys,
      ];
    },
});
