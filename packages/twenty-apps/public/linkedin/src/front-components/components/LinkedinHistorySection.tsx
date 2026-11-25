import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconHistory, IconListCheck } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LINKEDIN_HISTORY_CONVERSATION_LIMITS } from 'src/constants/linkedin-history-conversation-limits.constant';
import { LinkedinHistoryImportButton } from 'src/front-components/components/LinkedinHistoryImportButton';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from 'src/front-components/components/SettingsCardContentBase';
import { SettingsOptionCardContentSegmentedControl } from 'src/front-components/components/SettingsOptionCardContentSegmentedControl';
import { SettingsOptionIconCustomizer } from 'src/front-components/components/SettingsOptionIconCustomizer';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { type LinkedinHistoryConversationLimit } from 'src/types/linkedin-history-conversation-limit.type';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';
import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';
import { hasLinkedinHistoryToImport } from 'src/utils/has-linkedin-history-to-import.util';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

type LinkedinHistorySectionProps = {
  importPolicy: LinkedinImportPolicy;
  selectedChats: LinkedinSelectedChat[];
  historyConversationLimit: LinkedinHistoryConversationLimit;
  historyImport: LinkedinHistoryImportState | null;
  importProgress: number | undefined;
  isImportStarting: boolean;
  isImportCancelling: boolean;
  onHistoryConversationLimitChange: (
    historyConversationLimit: LinkedinHistoryConversationLimit,
  ) => void;
  onImport: () => void;
  onCancelImport: () => void;
};

export const LinkedinHistorySection = ({
  importPolicy,
  selectedChats,
  historyConversationLimit,
  historyImport,
  importProgress,
  isImportStarting,
  isImportCancelling,
  onHistoryConversationLimitChange,
  onImport,
  onCancelImport,
}: LinkedinHistorySectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('History')}
      description={t(
        'Import past LinkedIn conversations, as chosen in the Sync tab.',
      )}
    />
    <StyledStack>
      <StyledSettingsCard>
        {importPolicy === 'SELECTED' ? (
          <StyledSettingsCardContent>
            <StyledSettingsCardIcon>
              <SettingsOptionIconCustomizer Icon={IconListCheck} />
            </StyledSettingsCardIcon>
            <StyledSettingsCardTextContainer>
              <StyledSettingsCardTitle>
                {t('Selected chats')}
              </StyledSettingsCardTitle>
              <StyledSettingsCardDescription>
                {selectedChats.length > 0
                  ? t(
                      'Imports the conversations picked in the Sync tab ({count})',
                      { count: selectedChats.length },
                    )
                  : t('Pick conversations in the Sync tab to import them')}
              </StyledSettingsCardDescription>
            </StyledSettingsCardTextContainer>
          </StyledSettingsCardContent>
        ) : (
          <SettingsOptionCardContentSegmentedControl
            Icon={IconHistory}
            title={t('Past conversations')}
            description={t('Most recent conversations to import')}
            options={LINKEDIN_HISTORY_CONVERSATION_LIMITS.map((limit) => ({
              value: String(limit),
              label: String(limit),
            }))}
            value={String(historyConversationLimit)}
            onChange={(value) => {
              const limit = LINKEDIN_HISTORY_CONVERSATION_LIMITS.find(
                (candidate) => String(candidate) === value,
              );

              if (isDefined(limit)) {
                onHistoryConversationLimitChange(limit);
              }
            }}
          />
        )}
      </StyledSettingsCard>
      {(hasLinkedinHistoryToImport({ importPolicy, selectedChats }) ||
        historyImport?.status === 'IMPORTING') && (
        <LinkedinHistoryImportButton
          historyImport={historyImport}
          progress={importProgress}
          isStarting={isImportStarting}
          isCancelling={isImportCancelling}
          onImport={onImport}
          onCancel={onCancelImport}
        />
      )}
    </StyledStack>
  </Section.Root>
);
