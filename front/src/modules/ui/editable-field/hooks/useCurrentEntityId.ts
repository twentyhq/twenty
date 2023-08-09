import { useContext } from 'react';

import { EntityIdContext } from '../states/EditableFieldEntityIdContext';

export function useCurrentEntityId() {
  return useContext(EntityIdContext);
}
