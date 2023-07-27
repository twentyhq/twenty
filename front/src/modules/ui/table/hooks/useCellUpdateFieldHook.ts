import { useContext } from 'react';

import { EntityUpdateFieldHookContext } from '../states/EntityUpdateFieldHookContext';

export function useEntityUpdateFieldHook() {
  return useContext(EntityUpdateFieldHookContext);
}
