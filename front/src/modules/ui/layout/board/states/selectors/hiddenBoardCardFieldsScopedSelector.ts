import { selectorFamily } from 'recoil';

import { availableBoardCardFieldsScopedState } from '../availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const hiddenBoardCardFieldsScopedSelector = selectorFamily({
  key: 'hiddenBoardCardFieldsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const fields = get(boardCardFieldsScopedState(scopeId));
      const fieldKeys = fields.map(({ key }) => key);
      const otherAvailableKeys = get(
        availableBoardCardFieldsScopedState(scopeId),
      ).filter(({ key }) => !fieldKeys.includes(key));

      return [
        ...fields.filter((field) => !field.isVisible),
        ...otherAvailableKeys,
      ];
    },
});
