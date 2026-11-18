import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const useWidgetVisibilityContext = (): WidgetVisibilityContext => {
  const isMobile = useIsMobile();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const featureFlags = useWorkspaceFeatureFlagsMap();

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    targetRecordIdentifier?.id ?? '',
  );

  return useMemo(
    () =>
      buildWidgetVisibilityContext({
        isMobile,
        isInSidePanel,
        targetRecord: isDefined(recordStore) ? recordStore : undefined,
        featureFlags,
      }),
    [isMobile, isInSidePanel, recordStore, featureFlags],
  );
};
