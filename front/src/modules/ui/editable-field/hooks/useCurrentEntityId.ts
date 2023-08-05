import { useContext } from 'react';

import { EntityIdContext } from '../states/EntityIdContext';

export function useCurrentEntityId() {
  return useContext(EntityIdContext);
}
