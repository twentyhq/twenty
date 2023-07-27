import { atom } from 'recoil';

import { EntityFieldMetadata } from '../types/EntityFieldMetadata';

export const entityFieldMetadataArrayState = atom<EntityFieldMetadata[]>({
  key: 'entityFieldMetadataArrayState',
  default: [],
});
