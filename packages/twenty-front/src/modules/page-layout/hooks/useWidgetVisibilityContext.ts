import { useConditionalAvailabilityGlobalContext } from '@/conditional-availability/hooks/useConditionalAvailabilityGlobalContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const useWidgetVisibilityContext = (): WidgetVisibilityContext => {
  const isMobile = useIsMobile();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const globalContext = useConditionalAvailabilityGlobalContext();

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    targetRecordIdentifier?.id ?? '',
  );

  return useMemo(
    () =>
      buildWidgetVisibilityContext({
        globalContext,
        isMobile,
        isInSidePanel,
        targetRecord: isDefined(recordStore) ? recordStore : undefined,
      }),
    [globalContext, isMobile, isInSidePanel, recordStore],
  );
};
