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
import { themeCssVariables } from 'twenty-ui/theme';
import styled from '@emotion/styled';
import 'twenty-ui/style.css';

import { ALL_VIEW_FIELDS } from 'src/constants/all-view-fields';
import {
  BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { VIEW_FIELDS_SUGGESTION_DISMISSED_KEY } from 'src/constants/view-fields-suggestion';
import { findAllViewsMissingFields } from 'src/utils/find-all-views-missing-fields';

const ADD_COLUMNS_PROMPT = [
  'Add these columns to the views below and make them visible. Skip a view if it does not exist, and leave columns already shown as they are.\n',
  ...ALL_VIEW_FIELDS.map(
    ({ objectLabelPlural, fields }) =>
      `"All ${objectLabelPlural}" view:\n${fields
        .map(({ label, name }) => `- ${label} (${name})`)
        .join('\n')}\n`,
  ),
].join('\n');

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const handleAddColumns = () =>
  openSidePanelPage({
    page: SidePanelPages.AskAI,
    pageTitle: t('Ask AI'),
    preprompt: { text: ADD_COLUMNS_PROMPT, mode: 'PREFILL' },
  });

type ColumnsSuggestionState = 'none' | 'suggested' | 'dismissed';

const getColumnsSuggestionState = async (): Promise<ColumnsSuggestionState> => {
  if ((await findAllViewsMissingFields()).length === 0) {
    return 'none';
  }

  const { appKeyValue } = await new MetadataApiClient().query({
    appKeyValue: {
      __args: { key: VIEW_FIELDS_SUGGESTION_DISMISSED_KEY },
      value: true,
    },
  });

  return appKeyValue?.value?.isDismissed === true ? 'dismissed' : 'suggested';
};

const LastContactSettings = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [columnsSuggestionState, setColumnsSuggestionState] =
    useState<ColumnsSuggestionState>('none');

  useEffect(() => {
    getColumnsSuggestionState()
      .then(setColumnsSuggestionState)
      .catch((error) =>
        console.error('Could not read the last contact columns', error),
      );
  }, []);

  const handleHideSuggestion = async () => {
    try {
      await new MetadataApiClient().mutation({
        setAppKeyValue: {
          __args: {
            input: {
              key: VIEW_FIELDS_SUGGESTION_DISMISSED_KEY,
              value: { isDismissed: true },
            },
          },
          key: true,
        },
      });
      setColumnsSuggestionState('dismissed');
    } catch {
      enqueueSnackbar({
        message: t('Could not hide the suggestion. Try again.'),
        variant: 'error',
      });
    }
  };

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
    <StyledContainer>
      {columnsSuggestionState !== 'none' && (
        <Section.Root>
          <Section.Header
            title={t('Show last contact columns')}
            description={t(
              'Ask AI to add the last contact columns to the All People, All Companies, and All Opportunities views.',
            )}
          />
          <div
            style={{
              display: 'flex',
              gap: themeCssVariables.spacing[2],
            }}
          >
            <MainButton onClick={handleAddColumns}>
              {t('Add columns')}
            </MainButton>
            {columnsSuggestionState === 'suggested' && (
              <MainButton variant="outline" onClick={handleHideSuggestion}>
                {t('Hide suggestion')}
              </MainButton>
            )}
          </div>
        </Section.Root>
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
    </StyledContainer>
  );
};

export default defineFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'last-contact-settings',
  description:
    'Backfill last-contact fields and add the last-contact columns to the All views.',
  component: LastContactSettings,
});
