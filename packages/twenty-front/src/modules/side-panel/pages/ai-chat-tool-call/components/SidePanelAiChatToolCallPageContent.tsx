import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconId, IconStatusChange, IconTool } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { aiChatThreadToolPartFamilySelector } from '@/ai-chat/tool-calls/states/selectors/aiChatThreadToolPartFamilySelector';
import { getToolPartError } from '@/ai-chat/thinking-steps/utils/getToolPartError';
import { getToolRecordOutput } from '@/ai-chat/thinking-steps/utils/getToolRecordOutput';
import { unwrapToolPartInput } from '@/ai/utils/tool-display/unwrapToolPartInput';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelAiChatToolCallRecords } from '@/side-panel/pages/ai-chat-tool-call/components/SidePanelAiChatToolCallRecords';
import { DetailFieldRow } from '@/ui/layout/details/components/DetailFieldRow';
import { DetailFieldsCard } from '@/ui/layout/details/components/DetailFieldsCard';
import { DetailMessageCard } from '@/ui/layout/details/components/DetailMessageCard';
import { JsonSection } from '@/ui/layout/details/components/JsonSection';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const COLLAPSED_RECORD_COUNT = 5;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[3]};
`;

const StyledCopyableValue = styled.div`
  cursor: pointer;
  min-width: 0;
`;

type SidePanelAiChatToolCallPageContentProps = {
  threadId: string;
  toolCallId: string;
};

export const SidePanelAiChatToolCallPageContent = ({
  threadId,
  toolCallId,
}: SidePanelAiChatToolCallPageContentProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [areAllRecordsShown, setAreAllRecordsShown] = useState(false);
  const aiChatToolCallPart = useAtomFamilySelectorValue(
    aiChatThreadToolPartFamilySelector,
    { threadId, toolCallId },
  );

  if (!isDefined(aiChatToolCallPart)) {
    return null;
  }

  const { toolName, toolInput } = unwrapToolPartInput(aiChatToolCallPart);
  const { hasError, errorText } = getToolPartError(aiChatToolCallPart);
  const { recordReferences } = getToolRecordOutput(aiChatToolCallPart);
  const visibleRecordReferences = areAllRecordsShown
    ? recordReferences
    : recordReferences.slice(0, COLLAPSED_RECORD_COUNT);

  const payloadSections = [
    { title: t`Input`, payload: toolInput },
    { title: t`Output`, payload: aiChatToolCallPart.output },
  ].filter(({ payload }) => isDefined(payload));

  return (
    <SidePanelList
      selectableItemIds={visibleRecordReferences.map(
        ({ recordId }) => recordId,
      )}
    >
      <StyledContent>
        {hasError && isNonEmptyString(errorText) && (
          <DetailMessageCard title={t`Error`} message={errorText} />
        )}
        {isNonEmptyArray(recordReferences) && (
          <SidePanelAiChatToolCallRecords
            visibleRecordReferences={visibleRecordReferences}
            totalCount={recordReferences.length}
            onShowAll={() => setAreAllRecordsShown(true)}
          />
        )}
        <Section.Root>
          <Section.Header title={t`Details`} />
          <DetailFieldsCard>
            <DetailFieldRow Icon={IconStatusChange} label={t`Status`}>
              {hasError ? (
                <Status color="red">{t`Failed`}</Status>
              ) : (
                <Status color="green">{t`Completed`}</Status>
              )}
            </DetailFieldRow>
            <DetailFieldRow Icon={IconTool} label={t`Tool`}>
              {toolName}
            </DetailFieldRow>
            <DetailFieldRow Icon={IconId} label={t`Call ID`}>
              <StyledCopyableValue onClick={() => copyToClipboard(toolCallId)}>
                <OverflowingTextWithTooltip text={toolCallId} />
              </StyledCopyableValue>
            </DetailFieldRow>
          </DetailFieldsCard>
        </Section.Root>
        {payloadSections.map(({ title, payload }) => (
          <JsonSection key={title} title={title} value={payload as JsonValue} />
        ))}
      </StyledContent>
    </SidePanelList>
  );
};
