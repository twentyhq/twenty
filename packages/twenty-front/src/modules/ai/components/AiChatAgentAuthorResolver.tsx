import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { type AgentChatMessageAuthor } from '@/ai/types/AgentChatMessageAuthor';
import { getAgentChatAgentAuthor } from '@/ai/utils/getAgentChatAgentAuthor';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  FindChatMessageAgentDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const AGENT_DETAILS_ERROR_TOAST_DEDUPE_KEY = 'agent-details-query-error';

type AiChatAgentAuthorResolverProps = {
  agentId: string;
  children: (author: AgentChatMessageAuthor) => ReactNode;
};

export const AiChatAgentAuthorResolver = ({
  agentId,
  children,
}: AiChatAgentAuthorResolverProps) => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { data, error } = useQuery(FindChatMessageAgentDocument, {
    variables: { id: agentId },
    skip: !hasAiPermission,
    fetchPolicy: 'cache-first',
  });
  const isAgentUnavailable =
    isGraphqlErrorOfType(error, 'NOT_FOUND') ||
    isGraphqlErrorOfType(error, 'FORBIDDEN');
  const unexpectedError = isAgentUnavailable ? undefined : error;

  return (
    <>
      <ToastOnQueryErrorEffect
        error={unexpectedError}
        message={t`Failed to load agent details.`}
        dedupeKey={AGENT_DETAILS_ERROR_TOAST_DEDUPE_KEY}
      />
      {children(
        getAgentChatAgentAuthor({
          agentId,
          agentName: data?.findOneAgent.label,
        }),
      )}
    </>
  );
};
