import { createContext, useContext } from 'react';

export const RoutedFlowStateScopeContext = createContext<string | null>(null);

export const useRoutedFlowStateScopeId = () =>
  useContext(RoutedFlowStateScopeContext);
