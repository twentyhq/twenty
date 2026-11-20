import { useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  openSidePanelPage,
  SidePanelPages,
  t,
} from 'twenty-sdk/front-component';
import { MainButton, Section } from 'twenty-ui/components';
import 'twenty-ui/style.css';

import { INDEX_VIEW_FIELDS } from 'src/constants/index-view-fields';
import {
  BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const ADD_COLUMNS_PROMPT = [
  'Add these columns to the views below and make them visible. Skip a view if it does not exist, and leave columns already shown as they are.',
  ...INDEX_VIEW_FIELDS.map(
    ({ objectLabelPlural, fields }) =>
      `- "All ${objectLabelPlural}" view: ${fields
        .map(({ label, name }) => `${label} (${name})`)
        .join(', ')}`,
  ),
].join('\n');

const handleAddColumns = () =>
  openSidePanelPage({
    page: SidePanelPages.AskAI,
    pageTitle: t('Ask AI'),
    preprompt: { text: ADD_COLUMNS_PROMPT, mode: 'PREFILL' },
  });

const LastContactSettings = () => {
  const [isStarting, setIsStarting] = useState(false);

  const handleBackfill = async () => {
    setIsStarting(true);

    try {
      await new MetadataApiClient().mutation({
        enqueueJobs: {
          __args: {
            input: {
              logicFunctionUniversalIdentifier:
                BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
              jobs: [{ payload: {}, jobId: 'last-contact-backfill' }],
            },
          },
          enqueued: true,
        },
      });
      enqueueSnackbar({
        message: t('Backfill requested. Records will update in the background.'),
        variant: 'success',
      });
    } catch {
      enqueueSnackbar({
        message: t('Could not start the backfill. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t('Show last contact columns')}
          description={t(
            'Ask AI to add the last contact columns to the All People, All Companies, and All Opportunities views.',
          )}
        />
        <MainButton onClick={handleAddColumns}>{t('Add columns')}</MainButton>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t('Backfill last contact')}
          description={t(
            'Recompute last-contact fields for people, companies, and opportunities from synced emails and meetings.',
          )}
        />
        <MainButton
          onClick={handleBackfill}
          loading={isStarting}
          disabled={isStarting}
        >
          {t('Trigger backfill')}
        </MainButton>
      </Section.Root>
    </>
  );
};

export default defineFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'last-contact-settings',
  description:
    'Backfill last-contact fields and add the last-contact columns to the All views.',
  component: LastContactSettings,
});
