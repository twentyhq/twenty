import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  FindManyAgentsDocument,
  FindManyApplicationsDocument,
  FindManyLogicFunctionsDocument,
  GetApiKeysDocument,
} from '~/generated-metadata/graphql';

export type UsageLimitSpenderOption = {
  id: string;
  label: string;
  avatarUrl?: string | null;
};

type UsageLimitSpenderOptionsByType = Partial<
  Record<UsageLimitSpenderType, UsageLimitSpenderOption[]>
>;

export const useUsageLimitSpenderOptions = (
  spenderTypes: UsageLimitSpenderType[],
): {
  spenderOptionsByType: UsageLimitSpenderOptionsByType;
  loading: boolean;
} => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const { data: apiKeysData, loading: apiKeysLoading } = useQuery(
    GetApiKeysDocument,
    { skip: !spenderTypes.includes('apiKey') },
  );
  const { data: applicationsData, loading: applicationsLoading } = useQuery(
    FindManyApplicationsDocument,
    { skip: !spenderTypes.includes('application') },
  );
  const { data: agentsData, loading: agentsLoading } = useQuery(
    FindManyAgentsDocument,
    { skip: !spenderTypes.includes('agent') },
  );
  const { data: logicFunctionsData, loading: logicFunctionsLoading } = useQuery(
    FindManyLogicFunctionsDocument,
    { skip: !spenderTypes.includes('logicFunction') },
  );
  const buildOptions = (
    spenderType: UsageLimitSpenderType,
  ): UsageLimitSpenderOption[] => {
    switch (spenderType) {
      case 'userWorkspace':
        return currentWorkspaceMembers.flatMap((member) =>
          isDefined(member.userWorkspaceId)
            ? [
                {
                  id: member.userWorkspaceId,
                  label:
                    `${member.name.firstName} ${member.name.lastName}`.trim() ||
                    member.userEmail,
                  avatarUrl: member.avatarUrl,
                },
              ]
            : [],
        );
      case 'apiKey':
        return (apiKeysData?.apiKeys ?? [])
          .filter((apiKey) => !isDefined(apiKey.revokedAt))
          .map((apiKey) => ({ id: apiKey.id, label: apiKey.name }));
      case 'application':
        return (applicationsData?.findManyApplications ?? []).map(
          (application) => ({
            id: application.id,
            label: application.name,
            avatarUrl: application.logoUrl,
          }),
        );
      case 'agent':
        return (agentsData?.findManyAgents ?? []).map((agent) => ({
          id: agent.id,
          label: agent.label,
        }));
      case 'workflow':
        return [];
      case 'logicFunction':
        return (logicFunctionsData?.findManyLogicFunctions ?? []).map(
          (logicFunction) => ({
            id: logicFunction.id,
            label: logicFunction.name,
          }),
        );
      case 'workspace':
        return [];
    }
  };

  return {
    spenderOptionsByType: Object.fromEntries(
      spenderTypes.map((spenderType) => [
        spenderType,
        buildOptions(spenderType),
      ]),
    ),
    loading:
      apiKeysLoading ||
      applicationsLoading ||
      agentsLoading ||
      logicFunctionsLoading,
  };
};
