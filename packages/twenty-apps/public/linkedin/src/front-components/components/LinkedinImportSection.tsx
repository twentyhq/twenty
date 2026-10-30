import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { LinkedinImportRangeIcon } from 'src/front-components/components/LinkedinImportRangeIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledHint = styled.p`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
`;

type LinkedinImportSectionProps = {
  importRange: LinkedinImportRange;
  historyImport: LinkedinHistoryImportState | null;
  onChange: (importRange: LinkedinImportRange) => void;
};

export const LinkedinImportSection = ({
  importRange,
  historyImport,
  onChange,
}: LinkedinImportSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Import')}
      description={t(
        'Choose how far back conversations are imported. New messages are always imported.',
      )}
    />
    <StyledStack>
      <SettingsRadioCard
        value={importRange}
        onChange={onChange}
        options={[
          {
            value: 'LAST_30_DAYS',
            cardMedia: <LinkedinImportRangeIcon importRange="LAST_30_DAYS" />,
            title: t('Last 30 days'),
            description: t('Conversations with a message in the last 30 days'),
          },
          {
            value: 'LAST_90_DAYS',
            cardMedia: <LinkedinImportRangeIcon importRange="LAST_90_DAYS" />,
            title: t('Last 90 days'),
            description: t('Conversations with a message in the last 90 days'),
          },
          {
            value: 'LAST_365_DAYS',
            cardMedia: <LinkedinImportRangeIcon importRange="LAST_365_DAYS" />,
            title: t('Last year'),
            description: t('Conversations with a message in the last 365 days'),
          },
          {
            value: 'ALL',
            cardMedia: <LinkedinImportRangeIcon importRange="ALL" />,
            title: t('All'),
            description: t('Your whole LinkedIn message history'),
          },
        ]}
      />
      {historyImport?.status === 'IMPORTING' && (
        <StyledHint role="status">
          {t('Importing past conversations… {count} imported so far', {
            count: historyImport.importedConversationCount,
          })}
        </StyledHint>
      )}
      {historyImport?.status === 'COMPLETED' && (
        <StyledHint role="status">
          {t('{count} past conversations imported', {
            count: historyImport.importedConversationCount,
          })}
        </StyledHint>
      )}
      {historyImport?.status === 'FAILED' && (
        <InlineBanner layout="compact" status="error">
          {t(
            'The import stopped before finishing. Pick a range to start it again.',
          )}
        </InlineBanner>
      )}
      {!isDefined(historyImport) && (
        <StyledHint>
          {t('History is imported when you pick a range.')}
        </StyledHint>
      )}
    </StyledStack>
  </Section.Root>
);
