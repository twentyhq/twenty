import { createContext } from 'react';

export const EntityUpdateMutationContext = createContext<(params: any) => void>(
  {} as any,
);
