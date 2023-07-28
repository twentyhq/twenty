import { createContext } from 'react';

import { EntityFieldDefinition } from '../types/EntityFieldMetadata';

export const EntityFieldMetadataContext =
  createContext<EntityFieldDefinition<unknown> | null>(null);
