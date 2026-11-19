import { type ConditionalAvailabilityEditorContextValue } from '@/conditional-availability/types/ConditionalAvailabilityEditorContextValue';
import { createContext } from 'react';

export const ConditionalAvailabilityEditorContext =
  createContext<ConditionalAvailabilityEditorContextValue | null>(null);
