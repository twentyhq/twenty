import styled from '@emotion/styled';
import { isDefined } from 'twenty-sdk/utils';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  border: 1px solid ${() => themeCssVariables.border.color.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: space-between;
  padding: ${() => themeCssVariables.spacing[3]};
`;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledMeta = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledRight = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledBadges = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${() => themeCssVariables.color.blue};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  padding: 0;

  &:disabled {
    color: ${() => themeCssVariables.font.color.tertiary};
    cursor: default;
  }
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
`;

type TagColor = 'blue' | 'green' | 'orange' | 'red' | 'gray';

const getSourceLabel = (source: string | null): string =>
  source === SLACK_USER_LINK_SOURCE.MANUAL ? 'Set manually' : 'Matched on email';

const getSourceColor = (source: string | null): TagColor =>
  source === SLACK_USER_LINK_SOURCE.MANUAL ? 'blue' : 'green';

const CONSENT_LABELS: Record<string, string> = {
  [SLACK_USER_LINK_CONSENT_STATE.ACTIVE]: 'Active',
  [SLACK_USER_LINK_CONSENT_STATE.PENDING]: 'Awaiting consent',
  [SLACK_USER_LINK_CONSENT_STATE.DECLINED]: 'Declined',
  [SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET]: 'Admin set',
};

const CONSENT_COLORS: Record<string, TagColor> = {
  [SLACK_USER_LINK_CONSENT_STATE.ACTIVE]: 'green',
  [SLACK_USER_LINK_CONSENT_STATE.PENDING]: 'orange',
  [SLACK_USER_LINK_CONSENT_STATE.DECLINED]: 'red',
  [SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET]: 'gray',
};

type SlackUserLinksListProps = {
  slackUserLinks: SlackUserLinkRecord[];
  canManage: boolean;
  hasMore?: boolean;
  onRemove: (slackUserLink: SlackUserLinkRecord) => void;
  onResend: (slackUserLink: SlackUserLinkRecord) => void;
  removingLinkId: string | undefined;
  resendingLinkId: string | undefined;
};

export const SlackUserLinksList = ({
  slackUserLinks,
  canManage,
  hasMore = false,
  onRemove,
  onResend,
  removingLinkId,
  resendingLinkId,
}: SlackUserLinksListProps) => {
  if (slackUserLinks.length === 0) {
    return <StyledEmptyState>No Slack user links yet.</StyledEmptyState>;
  }

  return (
    <StyledList>
      {hasMore && (
        <StyledEmptyState>
          Showing {slackUserLinks.length} links; more exist than can be shown
          here.
        </StyledEmptyState>
      )}
      {slackUserLinks.map((slackUserLink) => {
        const consentState = slackUserLink.consentState ?? undefined;
        const isPending =
          consentState === SLACK_USER_LINK_CONSENT_STATE.PENDING;

        return (
          <StyledRow key={slackUserLink.id}>
            <StyledDetails>
              <StyledName>
                {slackUserLink.name ??
                  slackUserLink.slackUserId ??
                  'Unnamed link'}
              </StyledName>
              <StyledMeta>
                {slackUserLink.workspaceMemberName ?? 'No workspace member'}
              </StyledMeta>
              <StyledMeta>
                Slack user {slackUserLink.slackUserId ?? 'unknown'} · Team{' '}
                {slackUserLink.slackTeamId ?? 'unknown'}
              </StyledMeta>
            </StyledDetails>
            <StyledRight>
              <StyledBadges>
                {isDefined(consentState) &&
                  isDefined(CONSENT_LABELS[consentState]) && (
                    <Tag
                      color={CONSENT_COLORS[consentState] ?? 'gray'}
                      text={CONSENT_LABELS[consentState]}
                    />
                  )}
                <Tag
                  color={getSourceColor(slackUserLink.source)}
                  text={getSourceLabel(slackUserLink.source)}
                />
              </StyledBadges>
              {canManage && (
                <StyledActions>
                  {isPending && (
                    <StyledActionButton
                      type="button"
                      onClick={() => onResend(slackUserLink)}
                      disabled={resendingLinkId === slackUserLink.id}
                    >
                      {resendingLinkId === slackUserLink.id
                        ? 'Resending…'
                        : 'Resend request'}
                    </StyledActionButton>
                  )}
                  <StyledActionButton
                    type="button"
                    onClick={() => onRemove(slackUserLink)}
                    disabled={removingLinkId === slackUserLink.id}
                  >
                    {removingLinkId === slackUserLink.id
                      ? 'Removing…'
                      : 'Remove'}
                  </StyledActionButton>
                </StyledActions>
              )}
            </StyledRight>
          </StyledRow>
        );
      })}
    </StyledList>
  );
};
