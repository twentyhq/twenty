import { routedFlowStateScopeRegistry } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';
import { useEffect } from 'react';

type RoutedFlowStateScopeRetentionEffectProps = { scopeId: string };

export const RoutedFlowStateScopeRetentionEffect = ({
  scopeId,
}: RoutedFlowStateScopeRetentionEffectProps) => {
  useEffect(() => routedFlowStateScopeRegistry.retain(scopeId), [scopeId]);
  return null;
};
