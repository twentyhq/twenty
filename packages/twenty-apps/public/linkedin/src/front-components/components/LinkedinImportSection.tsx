import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { LinkedinImportPolicyIcon } from 'src/front-components/components/LinkedinImportPolicyIcon';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

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
  importPolicy: LinkedinImportPolicy;
  historyImport: LinkedinHistoryImportState | null;
  onChange: (importPolicy: LinkedinImportPolicy) => void;
};

export const LinkedinImportSection = ({
  importPolicy,
  historyImport,
  onChange,
}: LinkedinImportSectionProps) => (
  <Section.Root>
    <Section.Header
      title={t('Import')}
      description={t(
        'Choose which LinkedIn conversations are imported, past ones included.',
      )}
    />
    <StyledStack>
      <SettingsRadioCard
        value={importPolicy}
        onChange={onChange}
        options={[
          {
            value: 'ALL',
            cardMedia: <LinkedinImportPolicyIcon importPolicy="ALL" />,
            title: t('All chats'),
            description: t('Import every conversation'),
          },
          {
            value: 'CONTACTS_ONLY',
            cardMedia: (
              <LinkedinImportPolicyIcon importPolicy="CONTACTS_ONLY" />
            ),
            title: t('Contacts only'),
            description: t('Import chats with people already in Twenty'),
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
            'The import stopped before finishing. Pick an option to start it again.',
          )}
        </InlineBanner>
      )}
    </StyledStack>
  </Section.Root>
);
