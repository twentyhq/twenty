import { atom } from 'recoil';

import { EntityFieldDefinition } from '../types/EntityFieldMetadata';

export const entityFieldMetadataArrayState = atom<
  EntityFieldDefinition<unknown>[]
>({
  key: 'entityFieldMetadataArrayState',
  default: [],
});
