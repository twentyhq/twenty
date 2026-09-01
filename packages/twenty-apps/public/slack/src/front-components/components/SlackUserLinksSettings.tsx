import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SlackUserLinkForm } from 'src/front-components/components/SlackUserLinkForm';
import { SlackUserLinksList } from 'src/front-components/components/SlackUserLinksList';
import { UnlinkedSlackUsersList } from 'src/front-components/components/UnlinkedSlackUsersList';
import { useCanManageSlackUserLinks } from 'src/front-components/hooks/use-can-manage-slack-user-links';
import { useMatchSlackUserLinks } from 'src/front-components/hooks/use-match-slack-user-links';
import { useRemoveSlackUserLink } from 'src/front-components/hooks/use-remove-slack-user-link';
import { useResendSlackUserLinkConsent } from 'src/front-components/hooks/use-resend-slack-user-link-consent';
import { useSlackUserLinks } from 'src/front-components/hooks/use-slack-user-links';
import { useUnlinkedSlackUsers } from 'src/front-components/hooks/use-unlinked-slack-users';
import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledMatchAction = styled.div`
  display: flex;
  padding-bottom: ${() => themeCssVariables.spacing[3]};
`;

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;

export const SlackUserLinksSettings = () => {
  const { canManage, isPermissionLoading } = useCanManageSlackUserLinks();
  const {
    slackUserLinks,
    isSlackUserLinksLoading,
    errorMessage,
    hasMoreSlackUserLinks,
    refetchSlackUserLinks,
  } = useSlackUserLinks();
  const { removeSlackUserLink, removingLinkId } = useRemoveSlackUserLink();
  const { resendConsent, resendingLinkId } = useResendSlackUserLinkConsent();
  const {
    unlinkedSlackUsers,
    hasMoreUnlinkedSlackUsers,
    isUnlinkedSlackUsersLoading,
    unlinkedErrorMessage,
    refetchUnlinkedSlackUsers,
  } = useUnlinkedSlackUsers({ isEnabled: canManage });
  const { matchSlackUserLinks, isMatching } = useMatchSlackUserLinks();
  const [formPrefill, setFormPrefill] = useState<{
    slackUser: SlackResolvedUser;
    nonce: number;
  } | null>(null);

  const handleLinkSaved = async () => {
    await Promise.all([refetchSlackUserLinks(), refetchUnlinkedSlackUsers()]);
  };

  const handlePickUnlinkedUser = (slackUser: SlackResolvedUser) => {
    setFormPrefill({ slackUser, nonce: (formPrefill?.nonce ?? 0) + 1 });
  };

  const handleMatchByEmail = async () => {
    const result = await matchSlackUserLinks();

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      await handleLinkSaved();
    }
  };

  const handleRemove = async (slackUserLink: SlackUserLinkRecord) => {
    const result = await removeSlackUserLink(slackUserLink.id);

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      await handleLinkSaved();
    }
  };

  const handleResend = async (slackUserLink: SlackUserLinkRecord) => {
    if (
      !isNonEmptyString(slackUserLink.slackTeamId) ||
      !isNonEmptyString(slackUserLink.slackUserId)
    ) {
      enqueueSnackbar({
        message:
          'This link is missing its Slack ids, so the request cannot be resent.',
        variant: 'error',
      });

      return;
    }

    const result = await resendConsent({
      id: slackUserLink.id,
      slackTeamId: slackUserLink.slackTeamId,
      slackUserId: slackUserLink.slackUserId,
    });

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      await refetchSlackUserLinks();
    }
  };

  if (isPermissionLoading) {
    return <StyledCenteredState>Loading Slack user links…</StyledCenteredState>;
  }

  return (
    <StyledContainer>
      {!canManage && (
        <Callout
          variant="warning"
          title="You need the roles permission"
          description="Only members with the roles permission can create or change Slack user links. You can review the existing links below."
        />
      )}
      {canManage && (
        <SlackUserLinkForm
          key={formPrefill?.nonce ?? 0}
          existingLinks={slackUserLinks}
          onLinkSaved={handleLinkSaved}
          initialSlackUser={formPrefill?.slackUser ?? null}
        />
      )}
      {canManage && (
        <Section>
          <H2Title
            title="Unlinked Slack users"
            description="Slack users with no link yet. They talk to the assistant with its default role until they are linked."
          />
          <StyledMatchAction>
            <Button
              title={isMatching ? 'Matching…' : 'Match by email'}
              disabled={isMatching}
              onClick={handleMatchByEmail}
            />
          </StyledMatchAction>
          {isUnlinkedSlackUsersLoading && unlinkedSlackUsers.length === 0 ? (
            <StyledCenteredState>
              Loading unlinked Slack users…
            </StyledCenteredState>
          ) : isDefined(unlinkedErrorMessage) ? (
            <StyledCenteredState>{unlinkedErrorMessage}</StyledCenteredState>
          ) : (
            <UnlinkedSlackUsersList
              unlinkedSlackUsers={unlinkedSlackUsers}
              hasMore={hasMoreUnlinkedSlackUsers}
              onLink={handlePickUnlinkedUser}
            />
          )}
        </Section>
      )}
      <Section>
        <H2Title
          title="Slack user links"
          description="Each link maps a Slack account to the workspace member whose permissions the assistant borrows."
        />
        {isSlackUserLinksLoading && slackUserLinks.length === 0 ? (
          <StyledCenteredState>Loading links…</StyledCenteredState>
        ) : isDefined(errorMessage) ? (
          <StyledCenteredState>{errorMessage}</StyledCenteredState>
        ) : (
          <SlackUserLinksList
            slackUserLinks={slackUserLinks}
            canManage={canManage}
            hasMore={hasMoreSlackUserLinks}
            onRemove={handleRemove}
            onResend={handleResend}
            removingLinkId={removingLinkId}
            resendingLinkId={resendingLinkId}
          />
        )}
      </Section>
    </StyledContainer>
  );
};
