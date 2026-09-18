import { useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineSettingsFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { MainButton, Section } from 'twenty-ui/components';
import 'twenty-ui/style.css';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const LastContactSettings = () => {
  const [isStarting, setIsStarting] = useState(false);

  const handleBackfill = async () => {
    setIsStarting(true);

    try {
      await new MetadataApiClient().mutation({
        enqueueJob: {
          __args: {
            input: {
              logicFunctionUniversalIdentifier:
                BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
              payload: {},
              jobId: 'last-contact-backfill',
            },
          },
          enqueued: true,
        },
      });
      enqueueSnackbar({
        message: t(
          'Backfill requested. Records will update in the background.',
        ),
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
  );
};

export default defineSettingsFrontComponent({
  universalIdentifier: 'fc7e3633-efd9-4d58-a642-39b9b86096d3',
  name: 'last-contact-settings',
  description:
    'Backfill last-contact fields from existing emails and meetings.',
  component: LastContactSettings,
});
