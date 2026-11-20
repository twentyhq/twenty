import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  openSidePanelPage,
  SidePanelPages,
  t,
} from 'twenty-sdk/front-component';
import { MainButton, Section } from 'twenty-ui/components';
import { Callout } from 'twenty-ui/components/feedback';
import { IconInfoCircle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { type IndexViewFields } from 'src/constants/index-view-fields';
import {
  BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildAddIndexViewFieldsPrompt } from 'src/utils/build-add-index-view-fields-prompt';
import { findMissingIndexViewFields } from 'src/utils/find-missing-index-view-fields';

const LastContactSettings = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [missingIndexViewFields, setMissingIndexViewFields] = useState<
    IndexViewFields[]
  >([]);

  useEffect(() => {
    findMissingIndexViewFields()
      .then(setMissingIndexViewFields)
      .catch(() => setMissingIndexViewFields([]));
  }, []);

  const missingFieldCount = missingIndexViewFields.reduce(
    (count, { fields }) => count + fields.length,
    0,
  );

  const handleSetWithAda = () =>
    openSidePanelPage({
      page: SidePanelPages.AskAI,
      pageTitle: t('Ask AI'),
      preprompt: {
        text: buildAddIndexViewFieldsPrompt(missingIndexViewFields),
        mode: 'PREFILL',
      },
    });

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[6],
      }}
    >
      {missingFieldCount > 0 && (
        <Callout
          status="info"
          icon={
            <IconInfoCircle
              size={themeCssVariables.icon.size.md}
              aria-hidden={true}
            />
          }
          title={
            missingFieldCount === 1
              ? t(
                  'Last contact suggests 1 field that is not in your views yet.',
                )
              : t(
                  'Last contact suggests {missingFieldCount} fields that are not in your views yet.',
                  { missingFieldCount },
                )
          }
          action={
            <Callout.Action type="button" onClick={handleSetWithAda}>
              {t('Set with Ada')}
            </Callout.Action>
          }
          onDismiss={() => setMissingIndexViewFields([])}
          fullWidth
        />
      )}
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
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'last-contact-settings',
  description:
    'Suggests the last-contact fields missing from the All views and backfills last-contact fields.',
  component: LastContactSettings,
});
