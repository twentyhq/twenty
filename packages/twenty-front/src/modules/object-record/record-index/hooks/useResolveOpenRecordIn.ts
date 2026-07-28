import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import { DEFAULT_VIEW_OPEN_RECORD_IN } from '@/object-record/record-index/constants/DefaultViewOpenRecordIn';
import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useAtomValue } from 'jotai';
import { useIsMobile } from 'twenty-ui/utilities';

export const useResolveOpenRecordIn = (objectNameSingular: string) => {
  // Record chips also render where no context store is mounted at all, such as
  // a mention inside a note, and those have no view to take a setting from.
  const contextStoreInstanceId = useAvailableComponentInstanceId(
    ContextStoreComponentInstanceContext,
  );

  const contextStoreCurrentViewId = useAtomValue(
    contextStoreCurrentViewIdComponentState.atomFamily({
      instanceId: contextStoreInstanceId ?? '',
    }),
  );

  const currentView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const isMobile = useIsMobile();

  return resolveOpenRecordIn({
    openRecordInViewSetting:
      currentView?.openRecordIn ?? DEFAULT_VIEW_OPEN_RECORD_IN,
    openRecordInUserPreference:
      currentWorkspaceMember?.openRecordIn ?? DEFAULT_OPEN_RECORD_IN_PREFERENCE,
    objectNameSingular,
    canDisplaySidePanel: !isMobile,
  });
};
