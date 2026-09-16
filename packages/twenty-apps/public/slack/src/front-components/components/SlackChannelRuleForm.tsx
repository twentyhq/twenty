import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackChannelPicker } from 'src/front-components/components/SlackChannelPicker';
import { SlackChannelRuleCapabilitySelect } from 'src/front-components/components/SlackChannelRuleCapabilitySelect';
import { SlackChannelRuleModeSelect } from 'src/front-components/components/SlackChannelRuleModeSelect';
import { SlackPickedEntityButton } from 'src/front-components/components/SlackPickedEntityButton';
import { SlackUserLinkFormField } from 'src/front-components/components/SlackUserLinkFormField';
import { SlackUserLinkFormHint } from 'src/front-components/components/SlackUserLinkFormHint';
import { SLACK_CHANNEL_RULE_CAPABILITY_DESCRIPTIONS } from 'src/front-components/constants/slack-channel-rule-capability-labels.constant';
import { SLACK_CHANNEL_RULE_MODE_DESCRIPTIONS } from 'src/front-components/constants/slack-channel-rule-mode-labels.constant';
import { useSetSlackChannelRule } from 'src/front-components/hooks/use-set-slack-channel-rule';
import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { type SlackChannelSearchOption } from 'src/logic-functions/types/slack-channel-search.type';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type SlackChannelRuleFormProps = {
  existingRules: SlackChannelRuleRecord[];
  onRuleSaved: () => void;
  onCancel: () => void;
};

export const SlackChannelRuleForm = ({
  existingRules,
  onRuleSaved,
  onCancel,
}: SlackChannelRuleFormProps) => {
  const modeSelectId = useId();
  const capabilitySelectId = useId();
  const [selectedChannel, setSelectedChannel] =
    useState<SlackChannelSearchOption | null>(null);
  const [mode, setMode] = useState<SlackChannelRuleMode>(
    SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY,
  );
  const [capability, setCapability] = useState<SlackChannelRuleCapability>(
    SLACK_CHANNEL_RULE_CAPABILITY.FULL,
  );
  const { setSlackChannelRule, savingChannelId } = useSetSlackChannelRule();

  const isSubmitting = isDefined(savingChannelId);
  const canSubmit = isDefined(selectedChannel) && !isSubmitting;

  const existingRule = isDefined(selectedChannel)
    ? existingRules.find(
        (rule) => rule.slackChannelId === selectedChannel.slackChannelId,
      )
    : undefined;

  const handleSubmit = async () => {
    if (!isDefined(selectedChannel)) {
      return;
    }

    const result = await setSlackChannelRule({
      slackChannelId: selectedChannel.slackChannelId,
      name: selectedChannel.name,
      mode,
      capability,
    });

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      setSelectedChannel(null);
      onRuleSaved();
    }
  };

  return (
    <StyledForm
      onSubmit={(event) => {
        event.preventDefault();

        if (canSubmit) {
          handleSubmit();
        }
      }}
    >
      <SlackUserLinkFormField label="Channel">
        {isDefined(selectedChannel) ? (
          <SlackPickedEntityButton
            name={`#${selectedChannel.name}`}
            meta={
              selectedChannel.isPrivate ? 'Private channel' : 'Public channel'
            }
            changeLabel="Pick a different channel"
            onChangeRequest={() => setSelectedChannel(null)}
            disabled={isSubmitting}
          />
        ) : (
          <SlackChannelPicker
            onSelect={setSelectedChannel}
            disabled={isSubmitting}
            autoFocus
          />
        )}
      </SlackUserLinkFormField>
      <SlackUserLinkFormField label="Mode" htmlFor={modeSelectId}>
        <SlackChannelRuleModeSelect
          id={modeSelectId}
          value={mode}
          onChange={setMode}
          disabled={isSubmitting}
          ariaLabel="Rule mode"
        />
      </SlackUserLinkFormField>
      {mode !== SLACK_CHANNEL_RULE_MODE.SILENT && (
        <SlackUserLinkFormField label="Capability" htmlFor={capabilitySelectId}>
          <SlackChannelRuleCapabilitySelect
            id={capabilitySelectId}
            value={capability}
            onChange={setCapability}
            disabled={isSubmitting}
            ariaLabel="Rule capability"
          />
        </SlackUserLinkFormField>
      )}
      <SlackUserLinkFormHint>
        {[
          isDefined(existingRule)
            ? 'This channel already has a rule; saving replaces it.'
            : undefined,
          SLACK_CHANNEL_RULE_MODE_DESCRIPTIONS[mode],
          mode === SLACK_CHANNEL_RULE_MODE.SILENT
            ? undefined
            : SLACK_CHANNEL_RULE_CAPABILITY_DESCRIPTIONS[capability],
        ]
          .filter(isDefined)
          .join(' ')}
      </SlackUserLinkFormHint>
      <StyledActions>
        <Button
          type="button"
          title={isSubmitting ? 'Saving…' : 'Save rule'}
          variant="primary"
          accent="blue"
          disabled={!canSubmit}
          onClick={handleSubmit}
        />
        <Button
          type="button"
          title="Cancel"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        />
      </StyledActions>
    </StyledForm>
  );
};
