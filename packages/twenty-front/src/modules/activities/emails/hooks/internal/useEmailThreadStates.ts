import { emailThreadsPageComponentState } from '@/activities/emails/state/emailThreadsPageComponentState';
import { TabListScopeInternalContext } from '@/ui/layout/tab/scopes/scope-internal-context/TabListScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type useEmailThreadStatesProps = {
  emailThreadScopeId?: string;
};

export const useEmailThreadStates = ({
  emailThreadScopeId,
}: useEmailThreadStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    TabListScopeInternalContext,
    emailThreadScopeId,
  );

  return {
    scopeId,
    getEmailThreadsPageState: extractComponentState(
      emailThreadsPageComponentState,
      scopeId,
    ),
  };
};
