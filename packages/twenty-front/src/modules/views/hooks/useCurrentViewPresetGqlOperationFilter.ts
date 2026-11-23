import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { computeViewPresetGqlOperationFilter } from '@/views/utils/computeViewPresetGqlOperationFilter';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const useCurrentViewPresetGqlOperationFilter = (
  contextStoreInstanceId?: string,
): RecordGqlOperationFilter | undefined => {
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    contextStoreInstanceId,
  );

  const currentView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return computeViewPresetGqlOperationFilter({
    view: currentView,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
