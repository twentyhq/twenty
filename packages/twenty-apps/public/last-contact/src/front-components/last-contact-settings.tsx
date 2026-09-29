import { useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { MainButton } from 'twenty-ui/components';
import { Section } from 'twenty-ui/primitives/layout';
import { H2Title } from 'twenty-ui/primitives/typography';
import 'twenty-ui/style.css';

import {
  BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
    <Section>
      <H2Title
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
    </Section>
  );
};

export default defineFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'last-contact-settings',
  description: 'Backfill last-contact fields from existing emails and meetings.',
  component: LastContactSettings,
});
