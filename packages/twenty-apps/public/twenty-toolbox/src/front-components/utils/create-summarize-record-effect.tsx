import { useEffect } from 'react';
import {
  enqueueSnackbar,
  openSidePanelPage,
  SidePanelPages,
  unmountFrontComponent,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { buildSummarizePrompt } from 'src/front-components/utils/build-summarize-prompt';
import { fetchRecordLabel } from 'src/front-components/utils/fetch-record-label';
import { type SummarizeTarget } from 'src/front-components/utils/summarize-target';

// Headless effect shared by the three summarize commands: it resolves the
// selected record, then hands over to Ask AI with a pre-sent summary prompt.
export const createSummarizeRecordEffect = (target: SummarizeTarget) => {
  const SummarizeRecordEffect = () => {
    const selectedRecordIds = useSelectedRecordIds();

    useEffect(() => {
      const recordId =
        selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;

      if (recordId === null) {
        enqueueSnackbar({
          message: `Select a single ${target.label} to summarize`,
          variant: 'error',
        });
        unmountFrontComponent();

        return;
      }

      const summarize = async () => {
        const recordLabel = await fetchRecordLabel(target.key, recordId).catch(
          () => null,
        );

        try {
          await openSidePanelPage({
            page: SidePanelPages.AskAI,
            pageTitle: 'Ask AI',
            preprompt: {
              text: buildSummarizePrompt({ target, recordLabel, recordId }),
              mode: 'SEND',
            },
          });
        } catch {
          await enqueueSnackbar({
            message: 'Failed to open Ask AI',
            variant: 'error',
          });
        } finally {
          await unmountFrontComponent();
        }
      };

      summarize();
    }, [selectedRecordIds]);

    return null;
  };

  return SummarizeRecordEffect;
};
