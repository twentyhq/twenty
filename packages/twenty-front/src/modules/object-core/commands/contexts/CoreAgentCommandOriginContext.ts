import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
import { createContext } from 'react';

export const CoreAgentCommandOriginContext =
  createContext<CoreAgentCommandOrigin | null>(null);
