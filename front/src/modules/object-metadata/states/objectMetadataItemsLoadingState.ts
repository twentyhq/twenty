import { atom } from 'recoil';

export const objectMetadataItemsLoadingState = atom<boolean>({
  key: 'objectMetadataItemsLoadingState',
  default: true,
});
