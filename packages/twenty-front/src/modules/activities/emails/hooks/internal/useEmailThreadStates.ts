import { emailThreadsPageStateScopeMap } from '@/activities/emails/state/emailThreadsPageStateScopeMap';
import { TabListScopeInternalContext } from '@/ui/layout/tab/scopes/scope-internal-context/TabListScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

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
    getEmailThreadsPageState: getState(emailThreadsPageStateScopeMap, scopeId),
  };
};
