import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { computeViewPresetFilterGqlFilter } from 'twenty-shared/ai';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const useCurrentViewPresetGqlOperationFilter = (
  contextStoreInstanceId?: string,
): RecordGqlOperationFilter => {
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    contextStoreInstanceId,
  );

  const currentView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return computeViewPresetFilterGqlFilter({
    presetFilter: currentView?.presetFilter,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
