import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { agentChatOnlineWorkspaceMemberIdsState } from '@/ai/states/agentChatOnlineWorkspaceMemberIdsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledPresence = styled.span`
  display: inline-flex;
  position: relative;
`;

const StyledDot = styled.span<{ isOnline: boolean }>`
  background: ${({ isOnline }) =>
    isOnline
      ? themeCssVariables.color.green
      : themeCssVariables.font.color.light};
  border: 1px solid ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.rounded};
  bottom: calc(-1 * ${themeCssVariables.spacing['0.5']});
  box-sizing: border-box;
  height: ${themeCssVariables.spacing['1.5']};
  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing['0.5']});
  width: ${themeCssVariables.spacing['1.5']};
`;

type AiChatMemberPresenceProps = {
  workspaceMemberId: string | undefined;
  children: ReactNode;
};

export const AiChatMemberPresence = ({
  workspaceMemberId,
  children,
}: AiChatMemberPresenceProps) => {
  const { t } = useLingui();
  const agentChatOnlineWorkspaceMemberIds = useAtomStateValue(
    agentChatOnlineWorkspaceMemberIdsState,
  );

  if (
    !isDefined(agentChatOnlineWorkspaceMemberIds) ||
    !isDefined(workspaceMemberId)
  ) {
    return children;
  }

  const isOnline =
    agentChatOnlineWorkspaceMemberIds.includes(workspaceMemberId);

  return (
    <StyledPresence>
      {children}
      <StyledDot
        role="img"
        aria-label={isOnline ? t`Online` : t`Offline`}
        isOnline={isOnline}
      />
    </StyledPresence>
  );
};
