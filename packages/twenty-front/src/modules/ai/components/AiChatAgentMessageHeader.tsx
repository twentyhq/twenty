import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatMessageHeader } from '@/ai/components/AiChatMessageHeader';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  FindChatMessageAgentDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const { data } = useQuery(FindChatMessageAgentDocument, {
    variables: { id: agentId },
    skip: !hasAiPermission,
    fetchPolicy: 'cache-first',
    errorPolicy: 'ignore',
  });
  const agent = hasAiPermission ? data?.findOneAgent : undefined;
  const agentName = agent?.label ?? t`Agent`;

  return (
    <AiChatMessageHeader
      avatar={
        <Avatar colorSeed={agentId} name={agentName} size="sm" shape="circle" />
      }
      name={agentName}
      createdAt={createdAt}
    />
  );
};
