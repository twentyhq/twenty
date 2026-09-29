import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { OnboardingSkipDialog } from '@/onboarding/components/OnboardingSkipDialog';
import { OnboardingSkipDialogAvatars } from '@/onboarding/components/OnboardingSkipDialogAvatars';
import { ONBOARDING_INVITE_TEAM_EMPTY_SEATS_COUNT } from '@/onboarding/constants/OnboardingInviteTeamEmptySeatsCount';
import { ONBOARDING_SKIP_DIALOG_IDS } from '@/onboarding/constants/OnboardingSkipDialogIds';
import { onboardingInviteTeamCreditsRewardSelector } from '@/onboarding/states/selectors/onboardingInviteTeamCreditsRewardSelector';
import { onboardingInviteTeamValidEmailsSelector } from '@/onboarding/states/selectors/onboardingInviteTeamValidEmailsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type DialogPopupProps } from 'twenty-ui/primitives/surfaces';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type OnboardingInviteTeamSkipDialogProps = {
  isValid: boolean;
  finalFocus: DialogPopupProps['finalFocus'];
  onInvite: () => void;
  onSkip: () => void;
};

export const OnboardingInviteTeamSkipDialog = ({
  isValid,
  finalFocus,
  onInvite,
  onSkip,
}: OnboardingInviteTeamSkipDialogProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const onboardingInviteTeamValidEmails = useAtomStateValue(
    onboardingInviteTeamValidEmailsSelector,
  );
  const onboardingInviteTeamCreditsReward = useAtomStateValue(
    onboardingInviteTeamCreditsRewardSelector,
  );

  const hasInviteEmails = isNonEmptyArray(onboardingInviteTeamValidEmails);

  return (
    <OnboardingSkipDialog
      dialogId={ONBOARDING_SKIP_DIALOG_IDS.inviteTeam}
      visual={
        <OnboardingSkipDialogAvatars
          avatars={[
            ...(isDefined(currentWorkspaceMember)
              ? [
                  {
                    id: currentWorkspaceMember.id,
                    name: `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`,
                    src: getAbsoluteImageUrl(currentWorkspaceMember.avatarUrl),
                    shape: 'circle' as const,
                  },
                ]
              : []),
            ...onboardingInviteTeamValidEmails.map((email) => ({
              id: email,
              name: email,
              shape: 'circle' as const,
            })),
          ]}
          emptySeatsCount={
            hasInviteEmails ? 0 : ONBOARDING_INVITE_TEAM_EMPTY_SEATS_COUNT
          }
        />
      }
      title={
        hasInviteEmails
          ? plural(onboardingInviteTeamValidEmails.length, {
              one: "Your invite isn't sent yet",
              other: "Your # invites aren't sent yet",
            })
          : t`Twenty works better with your team`
      }
      description={
        hasInviteEmails ? undefined : t`All it takes is their email.`
      }
      actions={[
        hasInviteEmails && isValid
          ? {
              label: plural(onboardingInviteTeamValidEmails.length, {
                one: 'Send invite',
                other: 'Send # invites',
              }),
              onClick: onInvite,
            }
          : { label: t`Add teammates`, onClick: () => {} },
      ]}
      creditsReward={onboardingInviteTeamCreditsReward}
      isRewardPerItem={!hasInviteEmails}
      finalFocus={finalFocus}
      onSkip={onSkip}
    />
  );
};
