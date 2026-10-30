import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { findLinkedinPersonReviewCandidates } from 'src/logic-functions/utils/find-linkedin-person-review-candidates.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { getLinkedinPersonReviews } from 'src/logic-functions/utils/get-linkedin-person-reviews.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const buildLinkedinSettingsView = async (
  connection: AppConnection | undefined,
): Promise<LinkedinSettingsView> => {
  if (!isDefined(connection)) {
    return { isConnected: false };
  }

  const [settings, historyImport, personReviews] = await Promise.all([
    getLinkedinSettings(connection.id),
    getLinkedinHistoryImportState(connection.id),
    getLinkedinPersonReviews(connection.id),
  ]);

  const candidatesById = await findLinkedinPersonReviewCandidates([
    ...new Set(
      Object.values(personReviews).flatMap(
        (personReview) => personReview.candidatePersonIds,
      ),
    ),
  ]);

  return {
    isConnected: true,
    connection: {
      name: connection.name,
      handle: connection.handle,
      isAuthFailed: isDefined(connection.authFailedAt),
    },
    settings,
    historyImport,
    personReviews: Object.values(personReviews)
      .sort((left, right) =>
        right.lastMessageAt.localeCompare(left.lastMessageAt),
      )
      .map(({ candidatePersonIds, ...personReview }) => ({
        ...personReview,
        // Candidates deleted since the review was recorded drop out
        candidates: candidatePersonIds
          .map((personId) => candidatesById.get(personId))
          .filter(isDefined),
      })),
  };
};
