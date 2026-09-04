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
import { SLACK_CONNECTION_HEALTH_CALLOUTS } from 'src/front-components/constants/slack-connection-health-callouts.constant';
import { useCanManageSlackUserLinks } from 'src/front-components/hooks/use-can-manage-slack-user-links';
import { useMatchSlackUserLinks } from 'src/front-components/hooks/use-match-slack-user-links';
import { useSlackConnectionStatus } from 'src/front-components/hooks/use-slack-connection-status';
import { useRemoveSlackUserLink } from 'src/front-components/hooks/use-remove-slack-user-link';
import { useResendSlackUserLinkConsent } from 'src/front-components/hooks/use-resend-slack-user-link-consent';
import { useSlackUserLinks } from 'src/front-components/hooks/use-slack-user-links';
import { useUnlinkedSlackUsers } from 'src/front-components/hooks/use-unlinked-slack-users';
import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledMatchAction = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
  justify-content: flex-end;
  padding-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledMatchSummary = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledDisclosure = styled.div`
  align-self: flex-start;
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
    isSlackConnected,
    installedSlackTeamId,
    connectionHealth,
    hasRosterMatchFailed,
    isConnectionStatusLoading,
  } = useSlackConnectionStatus();
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
  } = useUnlinkedSlackUsers({ isEnabled: canManage && isSlackConnected });
  const { matchSlackUserLinks, isMatching } = useMatchSlackUserLinks();
  const [matchSummary, setMatchSummary] = useState<string | undefined>(
    undefined,
  );
  const [hasLastMatchRunFailed, setHasLastMatchRunFailed] = useState<
    boolean | undefined
  >(undefined);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);

  const handleLinkSaved = async () => {
    await Promise.all([refetchSlackUserLinks(), refetchUnlinkedSlackUsers()]);
  };

  const handleManualLinkSaved = async () => {
    setIsManualFormOpen(false);
    await handleLinkSaved();
  };

  const handleMatchByEmail = async () => {
    const result = await matchSlackUserLinks();

    if (!result.success) {
      setMatchSummary(undefined);
      setHasLastMatchRunFailed(true);
      enqueueSnackbar({
        message: isNonEmptyString(result.error) ? result.error : result.message,
        variant: 'error',
      });

      return;
    }

    setMatchSummary(result.message);
    setHasLastMatchRunFailed(result.failedCount > 0);
    await handleLinkSaved();
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

  if (isConnectionStatusLoading || !isSlackConnected) {
    return null;
  }

  const connectionHealthCallout = isDefined(connectionHealth)
    ? SLACK_CONNECTION_HEALTH_CALLOUTS[connectionHealth]
    : undefined;

  if (isDefined(connectionHealthCallout)) {
    return (
      <StyledContainer>
        <Callout
          variant="error"
          title={connectionHealthCallout.title}
          description={connectionHealthCallout.description}
        />
      </StyledContainer>
    );
  }

  if (isPermissionLoading) {
    return <StyledCenteredState>Loading Slack user links…</StyledCenteredState>;
  }

  const shouldWarnAboutRosterMatch =
    canManage && (hasLastMatchRunFailed ?? hasRosterMatchFailed);

  return (
    <StyledContainer>
      {!canManage && (
        <Callout
          variant="warning"
          title="You need the roles permission"
          description="Only members with the roles permission can create or change Slack user links. You can review the existing links below."
        />
      )}
      {shouldWarnAboutRosterMatch && (
        <Callout
          variant="warning"
          title="Email auto-link did not finish"
          description="The last automatic email match failed before linking everyone. Press Auto-link by email below to run it again."
        />
      )}
      {canManage && (
        <Section>
          <H2Title
            title="Unlinked Slack users"
            description="These Slack users talk to the assistant with its default role. Pick a workspace member on a row to link them in place, or auto-link everyone whose Slack email matches a workspace member."
          />
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
              onLinkSaved={handleLinkSaved}
            />
          )}
          <StyledMatchAction>
            {isDefined(matchSummary) && (
              <StyledMatchSummary>{matchSummary}</StyledMatchSummary>
            )}
            <Button
              type="button"
              title={isMatching ? 'Auto-linking…' : 'Auto-link by email'}
              size="small"
              variant="secondary"
              disabled={isMatching}
              onClick={handleMatchByEmail}
            />
          </StyledMatchAction>
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
            installedSlackTeamId={installedSlackTeamId}
            hasMore={hasMoreSlackUserLinks}
            onRemove={handleRemove}
            onResend={handleResend}
            removingLinkId={removingLinkId}
            resendingLinkId={resendingLinkId}
          />
        )}
      </Section>
      {canManage &&
        (isManualFormOpen ? (
          <SlackUserLinkForm
            existingLinks={slackUserLinks}
            onLinkSaved={handleManualLinkSaved}
          />
        ) : (
          <StyledDisclosure>
            <Button
              type="button"
              title="Link someone not listed above"
              size="small"
              variant="secondary"
              onClick={() => setIsManualFormOpen(true)}
            />
          </StyledDisclosure>
        ))}
    </StyledContainer>
  );
};
