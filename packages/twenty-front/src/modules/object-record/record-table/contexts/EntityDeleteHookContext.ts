import { createContext } from 'react';

export const EntityDeleteContext = createContext<
  (idToDelete: string) => Promise<unknown>
>(async () => {});
