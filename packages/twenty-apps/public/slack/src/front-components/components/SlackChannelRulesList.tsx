import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Tag } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackChannelRuleCapabilitySelect } from 'src/front-components/components/SlackChannelRuleCapabilitySelect';
import { SlackChannelRuleModeSelect } from 'src/front-components/components/SlackChannelRuleModeSelect';
import {
  SlackTable,
  SlackTableBody,
  SlackTableCell,
  SlackTableHeader,
  SlackTableRow,
} from 'src/front-components/components/SlackSettingsTable';
import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { isSlackChannelRuleCapability } from 'src/logic-functions/utils/is-slack-channel-rule-capability';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

const RULES_GRID_TEMPLATE_COLUMNS = 'minmax(0, 2fr) 200px 140px 156px';
const REMOVAL_CONFIRM_TIMEOUT_MS = 4000;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: ${() => themeCssVariables.spacing[1]} 0;
`;

const StyledName = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  min-width: 0;
`;

const StyledMeta = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
`;

const DISCONNECTED_WORKSPACE_LABEL = 'Slack workspace disconnected';

const isFromDisconnectedSlackWorkspace = ({
  rule,
  installedSlackTeamId,
}: {
  rule: SlackChannelRuleRecord;
  installedSlackTeamId: string | undefined;
}): boolean =>
  isNonEmptyString(installedSlackTeamId) &&
  isNonEmptyString(rule.slackTeamId) &&
  rule.slackTeamId !== installedSlackTeamId;

// A rule written before the field existed reads as full capability; a value
// this version cannot interpret is not the same thing and is left unlabelled.
const toDisplayedCapability = (
  capability: string | null,
): SlackChannelRuleCapability | undefined => {
  if (!isNonEmptyString(capability)) {
    return SLACK_CHANNEL_RULE_CAPABILITY.FULL;
  }

  return isSlackChannelRuleCapability(capability) ? capability : undefined;
};

const getDisplayedName = (rule: SlackChannelRuleRecord): string =>
  isNonEmptyString(rule.name)
    ? `#${rule.name}`
    : (rule.slackChannelId ?? 'Unnamed channel');

type SlackChannelRulesListProps = {
  slackChannelRules: SlackChannelRuleRecord[];
  canManage: boolean;
  installedSlackTeamId: string | undefined;
  hasMore?: boolean;
  onModeChange: (
    rule: SlackChannelRuleRecord,
    mode: SlackChannelRuleMode,
  ) => void;
  onCapabilityChange: (
    rule: SlackChannelRuleRecord,
    capability: SlackChannelRuleCapability,
  ) => void;
  onRemove: (rule: SlackChannelRuleRecord) => void;
  savingChannelId: string | undefined;
  removingRuleId: string | undefined;
};

export const SlackChannelRulesList = ({
  slackChannelRules,
  canManage,
  installedSlackTeamId,
  hasMore = false,
  onModeChange,
  onCapabilityChange,
  onRemove,
  savingChannelId,
  removingRuleId,
}: SlackChannelRulesListProps) => {
  const [removalArmedRuleId, setRemovalArmedRuleId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (removalArmedRuleId === null) {
      return undefined;
    }

    const disarmTimer = setTimeout(
      () => setRemovalArmedRuleId(null),
      REMOVAL_CONFIRM_TIMEOUT_MS,
    );

    return () => clearTimeout(disarmTimer);
  }, [removalArmedRuleId]);

  const isActionInFlight =
    isDefined(savingChannelId) || isDefined(removingRuleId);

  if (slackChannelRules.length === 0) {
    return (
      <StyledEmptyState>
        No channel rules yet. Every channel follows the workspace access mode.
      </StyledEmptyState>
    );
  }

  return (
    <SlackTable>
      <SlackTableRow gridTemplateColumns={RULES_GRID_TEMPLATE_COLUMNS}>
        <SlackTableHeader>Channel</SlackTableHeader>
        <SlackTableHeader>Mode</SlackTableHeader>
        <SlackTableHeader>Capability</SlackTableHeader>
        <SlackTableHeader align="right" />
      </SlackTableRow>
      <SlackTableBody>
        {slackChannelRules.map((rule) => {
          const isDisconnected = isFromDisconnectedSlackWorkspace({
            rule,
            installedSlackTeamId,
          });
          const displayedName = getDisplayedName(rule);
          const mode = isSlackChannelRuleMode(rule.mode)
            ? rule.mode
            : undefined;
          const capability = toDisplayedCapability(rule.capability);

          return (
            <SlackTableRow
              key={rule.id}
              gridTemplateColumns={RULES_GRID_TEMPLATE_COLUMNS}
            >
              <SlackTableCell>
                <StyledDetails>
                  <StyledName>
                    <OverflowingTextWithTooltip text={displayedName} />
                  </StyledName>
                  <StyledMeta>{rule.slackChannelId ?? 'unknown'}</StyledMeta>
                </StyledDetails>
              </SlackTableCell>
              <SlackTableCell>
                {isDisconnected ? (
                  <Tag color="gray" text={DISCONNECTED_WORKSPACE_LABEL} />
                ) : isDefined(mode) ? (
                  <SlackChannelRuleModeSelect
                    value={mode}
                    onChange={(nextMode) => onModeChange(rule, nextMode)}
                    disabled={!canManage || isActionInFlight}
                    ariaLabel={`Rule mode for ${displayedName}`}
                  />
                ) : (
                  <Tag color="red" text="Unknown mode" />
                )}
              </SlackTableCell>
              <SlackTableCell>
                {isDisconnected || mode === SLACK_CHANNEL_RULE_MODE.SILENT ? (
                  <Tag color="gray" text="Not applicable" />
                ) : isDefined(capability) ? (
                  <SlackChannelRuleCapabilitySelect
                    value={capability}
                    onChange={(nextCapability) =>
                      onCapabilityChange(rule, nextCapability)
                    }
                    disabled={!canManage || isActionInFlight}
                    ariaLabel={`Capability for ${displayedName}`}
                  />
                ) : (
                  <Tag color="red" text="Unknown capability" />
                )}
              </SlackTableCell>
              <SlackTableCell align="right">
                {canManage &&
                  (removalArmedRuleId === rule.id ? (
                    <Button
                      type="button"
                      title={
                        removingRuleId === rule.id
                          ? 'Removing…'
                          : 'Confirm removal'
                      }
                      size="small"
                      variant="secondary"
                      accent="danger"
                      disabled={isActionInFlight}
                      onClick={() => {
                        setRemovalArmedRuleId(null);
                        onRemove(rule);
                      }}
                    />
                  ) : (
                    <Button
                      type="button"
                      title="Remove"
                      size="small"
                      variant="secondary"
                      disabled={isActionInFlight}
                      onClick={() => setRemovalArmedRuleId(rule.id)}
                    />
                  ))}
              </SlackTableCell>
            </SlackTableRow>
          );
        })}
        {hasMore && (
          <StyledEmptyState>
            Showing {slackChannelRules.length} rules; more exist than can be
            shown here.
          </StyledEmptyState>
        )}
      </SlackTableBody>
    </SlackTable>
  );
};
