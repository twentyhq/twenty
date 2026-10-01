import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { Button } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackChannelRuleModeCell } from 'src/front-components/components/SlackChannelRuleModeCell';
import {
  SlackTable,
  SlackTableBody,
  SlackTableCell,
  SlackTableHeader,
  SlackTableRow,
} from 'src/front-components/components/SlackSettingsTable';
import { useArmedRemoval } from 'src/front-components/hooks/use-armed-removal';
import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';
import { isFromDisconnectedSlackWorkspace } from 'src/front-components/utils/is-from-disconnected-slack-workspace.util';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

const RULES_GRID_TEMPLATE_COLUMNS = 'minmax(0, 2fr) 220px 156px';

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
  onRemove,
  savingChannelId,
  removingRuleId,
}: SlackChannelRulesListProps) => {
  const {
    armedId: removalArmedRuleId,
    arm: armRuleRemoval,
    disarm: disarmRuleRemoval,
  } = useArmedRemoval();

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
        <SlackTableHeader align="right" />
      </SlackTableRow>
      <SlackTableBody>
        {slackChannelRules.map((rule) => {
          const displayedName = getDisplayedName(rule);

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
                <SlackChannelRuleModeCell
                  rule={rule}
                  displayedName={displayedName}
                  isDisconnected={isFromDisconnectedSlackWorkspace({
                    slackTeamId: rule.slackTeamId,
                    installedSlackTeamId,
                  })}
                  disabled={!canManage || isActionInFlight}
                  onModeChange={(nextMode) => onModeChange(rule, nextMode)}
                />
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
                        disarmRuleRemoval();
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
                      onClick={() => armRuleRemoval(rule.id)}
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
