import { atom } from 'recoil';

export const dropdownWidthState = atom<
  number | `${string}px` | 'auto' | undefined
>({
  key: 'dropdownWidthState',
  default: 0,
});
