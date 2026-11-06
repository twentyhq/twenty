import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatMessageHeader } from '@/ai/components/AiChatMessageHeader';
import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  FindChatMessageAgentDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const AGENT_DETAILS_ERROR_TOAST_DEDUPE_KEY = 'agent-details-query-error';

type AiChatAgentMessageHeaderProps = {
  agentId: string;
  createdAt: Date | string;
};

export const AiChatAgentMessageHeader = ({
  agentId,
  createdAt,
}: AiChatAgentMessageHeaderProps) => {
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
  const unexpectedError =
    hasAiPermission && !isAgentUnavailable ? error : undefined;
  const agent = hasAiPermission ? data?.findOneAgent : undefined;
  const agentName = agent?.label ?? t`Agent`;

  return (
    <>
      <ToastOnQueryErrorEffect
        error={unexpectedError}
        message={t`Failed to load agent details.`}
        dedupeKey={AGENT_DETAILS_ERROR_TOAST_DEDUPE_KEY}
      />
      <AiChatMessageHeader
        avatar={
          <Avatar
            colorSeed={agentId}
            name={agentName}
            size="sm"
            shape="circle"
          />
        }
        name={agentName}
        createdAt={createdAt}
      />
    </>
  );
};
