import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ToolRecordReference } from 'twenty-shared/ai';
import { Section } from 'twenty-ui/components/layout';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { SidePanelAiChatToolCallRecordItem } from '@/side-panel/pages/ai-chat-tool-call/components/SidePanelAiChatToolCallRecordItem';

const StyledRecords = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  margin: 0 calc(-1 * ${themeCssVariables.spacing[1]});
`;

const StyledShowMoreContainer = styled.div`
  align-self: flex-start;
`;

type SidePanelAiChatToolCallRecordsProps = {
  visibleRecordReferences: ToolRecordReference[];
  totalCount: number;
  onShowAll: () => void;
};

export const SidePanelAiChatToolCallRecords = ({
  visibleRecordReferences,
  totalCount,
  onShowAll,
}: SidePanelAiChatToolCallRecordsProps) => {
  const { t } = useLingui();
  const hiddenCount = totalCount - visibleRecordReferences.length;

  return (
    <Section.Root>
      <Section.Header
        title={t`Records`}
        actions={
          <Text size="sm" color="light">
            {totalCount}
          </Text>
        }
      />
      <StyledRecords>
        {visibleRecordReferences.map((recordReference) => (
          <SidePanelAiChatToolCallRecordItem
            key={recordReference.recordId}
            recordReference={recordReference}
          />
        ))}
      </StyledRecords>
      {hiddenCount > 0 && (
        <StyledShowMoreContainer>
          <FieldWidgetShowMoreButton
            remainingCount={hiddenCount}
            onClick={onShowAll}
          />
        </StyledShowMoreContainer>
      )}
    </Section.Root>
  );
};
