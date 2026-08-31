import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useContext } from 'react';

export const useRoutedFlowStateScopeId = () =>
  useContext(RoutedFlowStateScopeContext);
