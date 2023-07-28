import { createContext } from 'react';

import { EntityFieldMetadata } from '../types/EntityFieldMetadata';

export const EntityFieldMetadataContext =
  createContext<EntityFieldMetadata | null>(null);
