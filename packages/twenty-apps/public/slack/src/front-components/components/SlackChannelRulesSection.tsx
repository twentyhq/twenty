import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SlackChannelRuleForm } from 'src/front-components/components/SlackChannelRuleForm';
import { SlackChannelRulesList } from 'src/front-components/components/SlackChannelRulesList';
import { useRemoveSlackChannelRule } from 'src/front-components/hooks/use-remove-slack-channel-rule';
import { useSetSlackChannelRule } from 'src/front-components/hooks/use-set-slack-channel-rule';
import { useSlackChannelRules } from 'src/front-components/hooks/use-slack-channel-rules';
import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';
import { enqueueSlackToolResultSnackbar } from 'src/front-components/utils/enqueue-slack-tool-result-snackbar.util';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

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

const StyledDisclosure = styled.div`
  align-self: flex-start;
  padding-top: ${() => themeCssVariables.spacing[2]};
`;

type SlackChannelRulesSectionProps = {
  canManage: boolean;
  installedSlackTeamId: string | undefined;
};

export const SlackChannelRulesSection = ({
  canManage,
  installedSlackTeamId,
}: SlackChannelRulesSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    slackChannelRules,
    isSlackChannelRulesLoading,
    channelRulesErrorMessage,
    hasMoreSlackChannelRules,
    refetchSlackChannelRules,
  } = useSlackChannelRules();
  const { setSlackChannelRule, savingChannelId } = useSetSlackChannelRule();
  const { removeSlackChannelRule, removingRuleId } =
    useRemoveSlackChannelRule();

  const handleModeChange = async (
    rule: SlackChannelRuleRecord,
    mode: SlackChannelRuleMode,
  ) => {
    if (!isNonEmptyString(rule.slackChannelId)) {
      return;
    }

    const result = await setSlackChannelRule({
      slackChannelId: rule.slackChannelId,
      name: rule.name ?? undefined,
      mode,
    });

    enqueueSlackToolResultSnackbar(result);

    if (result.success) {
      await refetchSlackChannelRules();
    }
  };

  const handleCapabilityChange = async (
    rule: SlackChannelRuleRecord,
    capability: SlackChannelRuleCapability,
  ) => {
    if (
      !isNonEmptyString(rule.slackChannelId) ||
      !isSlackChannelRuleMode(rule.mode)
    ) {
      return;
    }

    const result = await setSlackChannelRule({
      slackChannelId: rule.slackChannelId,
      name: rule.name ?? undefined,
      mode: rule.mode,
      capability,
    });

    enqueueSlackToolResultSnackbar(result);

    await refetchSlackChannelRules();
  };

  const handleRemove = async (rule: SlackChannelRuleRecord) => {
    const result = await removeSlackChannelRule(rule.id);

    enqueueSlackToolResultSnackbar(result);

    if (result.success) {
      await refetchSlackChannelRules();
    }
  };

  const handleRuleSaved = async () => {
    setIsFormOpen(false);
    await refetchSlackChannelRules();
  };

  return (
    <Section>
      <H2Title
        title="Channels"
        description="Override the workspace access mode for specific channels: open a channel to anyone, restrict it to linked members, or silence the assistant there, and cap what it may do. Channels without a rule follow the setting above with full capability."
      />
      {isSlackChannelRulesLoading && slackChannelRules.length === 0 ? (
        <StyledCenteredState>Loading channel rules…</StyledCenteredState>
      ) : isDefined(channelRulesErrorMessage) ? (
        <StyledCenteredState>{channelRulesErrorMessage}</StyledCenteredState>
      ) : (
        <SlackChannelRulesList
          slackChannelRules={slackChannelRules}
          canManage={canManage}
          installedSlackTeamId={installedSlackTeamId}
          hasMore={hasMoreSlackChannelRules}
          onModeChange={handleModeChange}
          onCapabilityChange={handleCapabilityChange}
          onRemove={handleRemove}
          savingChannelId={savingChannelId}
          removingRuleId={removingRuleId}
        />
      )}
      {canManage &&
        (isFormOpen ? (
          <SlackChannelRuleForm
            existingRules={slackChannelRules}
            onRuleSaved={handleRuleSaved}
            onCancel={() => setIsFormOpen(false)}
          />
        ) : (
          <StyledDisclosure>
            <Button
              type="button"
              title="Add a channel rule"
              size="small"
              variant="secondary"
              onClick={() => setIsFormOpen(true)}
            />
          </StyledDisclosure>
        ))}
    </Section>
  );
};
