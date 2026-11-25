import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  type GetJsonNodeHighlighting,
  JsonTree,
} from 'twenty-ui/components/data-display';
import { LightButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import {
  IconAlertTriangle,
  IconCopy,
  IconId,
  IconStatusChange,
  IconTool,
} from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { unwrapToolPartInput } from '@/ai/utils/tool-display/unwrapToolPartInput';
import { LogConsoleFieldsCard } from '@/log-console/components/LogConsoleFieldsCard';
import { BillingFieldRow } from '@/settings/billing/components/internal/SettingsBillingCardField';
import { aiChatToolCallPartComponentState } from '@/side-panel/states/aiChatToolCallPartComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPayload = styled.div`
  overflow-x: auto;
`;

const StyledCopyableValue = styled.div`
  cursor: pointer;
  min-width: 0;
`;

const highlightErrorNodes: GetJsonNodeHighlighting = (keyPath) =>
  keyPath.startsWith('error') ? 'red' : undefined;

export const SidePanelAiChatToolCallPage = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const aiChatToolCallPart = useAtomComponentStateValue(
    aiChatToolCallPartComponentState,
  );

  if (!isDefined(aiChatToolCallPart)) {
    return null;
  }

  const { toolName, toolInput } = unwrapToolPartInput(aiChatToolCallPart);
  const hasError = aiChatToolCallPart.state === 'output-error';
  const output = hasError
    ? { error: aiChatToolCallPart.errorText }
    : aiChatToolCallPart.output;

  const payloadSections = [
    { title: t`Input`, payload: toolInput, isError: false },
    { title: t`Output`, payload: output, isError: hasError },
  ].filter(({ payload }) => isDefined(payload));

  return (
    <StyledContent>
      <Section.Root>
        <Section.Header title={t`Details`} />
        <LogConsoleFieldsCard>
          <BillingFieldRow Icon={IconStatusChange} label={t`Status`}>
            {hasError ? (
              <Status color="red">{t`Failed`}</Status>
            ) : (
              <Status color="green">{t`Completed`}</Status>
            )}
          </BillingFieldRow>
          {hasError && isNonEmptyString(aiChatToolCallPart.errorText) && (
            <BillingFieldRow Icon={IconAlertTriangle} label={t`Error`}>
              <OverflowingTextWithTooltip text={aiChatToolCallPart.errorText} />
            </BillingFieldRow>
          )}
          <BillingFieldRow Icon={IconTool} label={t`Tool`}>
            {toolName}
          </BillingFieldRow>
          <BillingFieldRow Icon={IconId} label={t`Call ID`}>
            <StyledCopyableValue
              onClick={() => copyToClipboard(aiChatToolCallPart.toolCallId)}
            >
              <OverflowingTextWithTooltip
                text={aiChatToolCallPart.toolCallId}
              />
            </StyledCopyableValue>
          </BillingFieldRow>
        </LogConsoleFieldsCard>
      </Section.Root>

      {payloadSections.map(({ title, payload, isError }) => (
        <Section.Root key={title}>
          <Section.Header
            title={title}
            actions={
              <LightButton
                startIcon={<IconCopy />}
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(payload, null, 2),
                    t`Copied as JSON`,
                  )
                }
              >
                {t`Copy as JSON`}
              </LightButton>
            }
          />
          <StyledPayload>
            <JsonTree
              value={payload as JsonValue}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              getNodeHighlighting={isError ? highlightErrorNodes : undefined}
              onNodeValueClick={copyToClipboard}
            />
          </StyledPayload>
        </Section.Root>
      ))}
    </StyledContent>
  );
};
