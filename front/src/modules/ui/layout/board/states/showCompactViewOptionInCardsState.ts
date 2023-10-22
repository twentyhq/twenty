import { atom } from 'recoil';

export const showCompactViewOptionInCardsState = atom<boolean>({
  key: 'showCompactViewOptionInCardsState',
  default: false,
});
