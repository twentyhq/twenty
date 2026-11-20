import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { onlineWorkspaceMemberIdsState } from '@/tab-presence/states/onlineWorkspaceMemberIdsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledPresence = styled.span`
  display: inline-flex;
  position: relative;
`;

const StyledDot = styled.span<{ isOnline: boolean }>`
  background: ${({ isOnline }) =>
    isOnline
      ? themeCssVariables.color.green
      : themeCssVariables.grayScale.gray9};
  border-radius: ${themeCssVariables.border.radius.rounded};
  bottom: -1px;
  box-shadow: 0 0 0 ${themeCssVariables.spacing['0.5']}
    color-mix(in srgb, ${themeCssVariables.background.primary} 80%, transparent);
  corner-shape: round;
  height: ${themeCssVariables.spacing['1.5']};
  position: absolute;
  right: -1px;
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
  const onlineWorkspaceMemberIds = useAtomStateValue(
    onlineWorkspaceMemberIdsState,
  );

  if (!isDefined(onlineWorkspaceMemberIds) || !isDefined(workspaceMemberId)) {
    return children;
  }

  const isOnline = onlineWorkspaceMemberIds.includes(workspaceMemberId);

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
