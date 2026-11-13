import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconSettings } from 'twenty-ui/icon';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUserCreditsBannerDismissalState } from '@/ai/states/agentChatUserCreditsBannerDismissalState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const AiChatUserCreditsExhaustedBanner = () => {
  const { t } = useLingui();

  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const navigateSettings = useNavigateSettings();

  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const [
    agentChatUserCreditsBannerDismissal,
    setAgentChatUserCreditsBannerDismissal,
  ] = useAtomState(agentChatUserCreditsBannerDismissalState);

  const { userCreditsUsage } = useAiChatUserCreditsUsage({
    skip: isWorkspaceSetupChat,
  });

  if (
    !isDefined(currentWorkspaceMember) ||
    !isDefined(userCreditsUsage) ||
    !userCreditsUsage.isExhausted
  ) {
    return null;
  }

  const { periodEnd, isFallingBackToWorkspaceCredits } = userCreditsUsage;

  if (
    agentChatUserCreditsBannerDismissal?.workspaceMemberId ===
      currentWorkspaceMember.id &&
    agentChatUserCreditsBannerDismissal.periodEnd === periodEnd &&
    agentChatUserCreditsBannerDismissal.isFallingBackToWorkspaceCredits ===
      isFallingBackToWorkspaceCredits
  ) {
    return null;
  }

  const dismissAction = (
    <InlineBanner.Action
      onClick={() =>
        setAgentChatUserCreditsBannerDismissal({
          workspaceMemberId: currentWorkspaceMember.id,
          periodEnd,
          isFallingBackToWorkspaceCredits,
        })
      }
    >{t`Dismiss`}</InlineBanner.Action>
  );

  if (isFallingBackToWorkspaceCredits) {
    return (
      <AiChatInlineBanner
        status="info"
        action={dismissAction}
      >{t`Weekly personal AI usage reached. Now using workspace credits.`}</AiChatInlineBanner>
    );
  }

  if (hasPermissionToManageBilling) {
    return (
      <AiChatInlineBanner
        action={
          <InlineBanner.Action
            startIcon={<IconSettings />}
            onClick={() => navigateSettings(SettingsPath.Billing)}
          >{t`Settings`}</InlineBanner.Action>
        }
      >{t`Weekly personal AI usage reached. Enable workspace credits to continue.`}</AiChatInlineBanner>
    );
  }

  return (
    <AiChatInlineBanner
      action={dismissAction}
    >{t`Weekly personal AI usage reached. Ask an admin to enable workspace credits.`}</AiChatInlineBanner>
  );
};
