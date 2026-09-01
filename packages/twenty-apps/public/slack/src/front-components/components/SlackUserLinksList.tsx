import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar, Tag } from 'twenty-ui/data-display';
import {
  IconSend,
  IconTrash,
  type IconComponent,
  type IconComponentProps,
} from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  SlackTable,
  SlackTableBody,
  SlackTableCell,
  SlackTableHeader,
  SlackTableRow,
} from 'src/front-components/components/SlackSettingsTable';
import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { isSlackUserLinkConsentState } from 'src/logic-functions/utils/is-slack-user-link-consent-state';
import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';

const LINKS_GRID_TEMPLATE_COLUMNS = '3fr 3fr 2fr 80px';

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  min-width: 0;
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
`;

// The app's React types differ from twenty-ui's, so the tabler icons need a
// local wrapper to satisfy the IconComponent prop.
const ResendIcon: IconComponent = (props: IconComponentProps) => (
  <IconSend {...props} />
);

const RemoveIcon: IconComponent = (props: IconComponentProps) => (
  <IconTrash {...props} />
);

type TagColor = 'blue' | 'green' | 'orange' | 'red' | 'gray';

const getSourceLabel = (source: string | null): string =>
  source === SLACK_USER_LINK_SOURCE.MANUAL
    ? 'Set manually'
    : 'Matched on email';

const getSourceColor = (source: string | null): TagColor =>
  source === SLACK_USER_LINK_SOURCE.MANUAL ? 'blue' : 'green';

// An absent state is a pre-consent link and still lends access; a state this
// version cannot interpret is not the same thing and is left unlabelled.
const toDisplayedConsentState = (
  consentState: string | null,
): SlackUserLinkConsentState | undefined => {
  if (!isNonEmptyString(consentState)) {
    return SLACK_USER_LINK_CONSENT_STATE.ACTIVE;
  }

  return isSlackUserLinkConsentState(consentState) ? consentState : undefined;
};

const CONSENT_LABELS: Record<SlackUserLinkConsentState, string> = {
  [SLACK_USER_LINK_CONSENT_STATE.ACTIVE]: 'Active',
  [SLACK_USER_LINK_CONSENT_STATE.PENDING]: 'Awaiting consent',
  [SLACK_USER_LINK_CONSENT_STATE.DECLINED]: 'Declined',
  [SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET]: 'Admin set',
};

const CONSENT_COLORS: Record<SlackUserLinkConsentState, TagColor> = {
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
  const [removalArmedLinkId, setRemovalArmedLinkId] = useState<string | null>(
    null,
  );

  const isActionInFlight =
    isDefined(removingLinkId) || isDefined(resendingLinkId);

  if (slackUserLinks.length === 0) {
    return <StyledEmptyState>No Slack user links yet.</StyledEmptyState>;
  }

  return (
    <SlackTable>
      <SlackTableRow gridTemplateColumns={LINKS_GRID_TEMPLATE_COLUMNS}>
        <SlackTableHeader>Slack account</SlackTableHeader>
        <SlackTableHeader>Workspace member</SlackTableHeader>
        <SlackTableHeader>Status</SlackTableHeader>
        <SlackTableHeader align="right" />
      </SlackTableRow>
      <SlackTableBody>
        {slackUserLinks.map((slackUserLink) => {
          const consentState = toDisplayedConsentState(
            slackUserLink.consentState,
          );
          const isPending =
            consentState === SLACK_USER_LINK_CONSENT_STATE.PENDING;
          const displayedName =
            slackUserLink.name ?? slackUserLink.slackUserId ?? 'Unnamed link';

          return (
            <SlackTableRow
              key={slackUserLink.id}
              gridTemplateColumns={LINKS_GRID_TEMPLATE_COLUMNS}
            >
              <SlackTableCell>
                <StyledIdentity>
                  <Avatar
                    placeholder={displayedName}
                    placeholderColorSeed={slackUserLink.id}
                    type="rounded"
                    size="md"
                  />
                  <StyledName>
                    <OverflowingTextWithTooltip text={displayedName} />
                  </StyledName>
                </StyledIdentity>
              </SlackTableCell>
              <SlackTableCell>
                <OverflowingTextWithTooltip
                  text={
                    slackUserLink.workspaceMemberName ?? 'No workspace member'
                  }
                />
              </SlackTableCell>
              <SlackTableCell>
                {isDefined(consentState) && (
                  <Tag
                    color={CONSENT_COLORS[consentState]}
                    text={CONSENT_LABELS[consentState]}
                  />
                )}
                <Tag
                  color={getSourceColor(slackUserLink.source)}
                  text={getSourceLabel(slackUserLink.source)}
                />
              </SlackTableCell>
              <SlackTableCell align="right">
                {canManage && (
                  <>
                    {isPending && (
                      <LightIconButton
                        Icon={ResendIcon}
                        title={
                          resendingLinkId === slackUserLink.id
                            ? 'Resending…'
                            : 'Resend the approval request'
                        }
                        size="small"
                        accent="tertiary"
                        disabled={isActionInFlight}
                        onClick={() => onResend(slackUserLink)}
                      />
                    )}
                    {removalArmedLinkId === slackUserLink.id ? (
                      <Button
                        title={
                          removingLinkId === slackUserLink.id
                            ? 'Removing…'
                            : 'Confirm removal'
                        }
                        size="small"
                        variant="secondary"
                        accent="danger"
                        disabled={isActionInFlight}
                        onClick={() => {
                          setRemovalArmedLinkId(null);
                          onRemove(slackUserLink);
                        }}
                      />
                    ) : (
                      <LightIconButton
                        Icon={RemoveIcon}
                        title="Remove the link"
                        size="small"
                        accent="tertiary"
                        disabled={isActionInFlight}
                        onClick={() => setRemovalArmedLinkId(slackUserLink.id)}
                      />
                    )}
                  </>
                )}
              </SlackTableCell>
            </SlackTableRow>
          );
        })}
        {hasMore && (
          <StyledEmptyState>
            Showing {slackUserLinks.length} links; more exist than can be shown
            here.
          </StyledEmptyState>
        )}
      </SlackTableBody>
    </SlackTable>
  );
};
