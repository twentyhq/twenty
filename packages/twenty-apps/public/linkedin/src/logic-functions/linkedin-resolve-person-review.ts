import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_RESOLVE_PERSON_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinSettingsView } from 'src/logic-functions/utils/build-linkedin-settings-view.util';
import { createLinkedinPerson } from 'src/logic-functions/utils/create-linkedin-person.util';
import { findOwnLinkedinConnection } from 'src/logic-functions/utils/find-own-linkedin-connection.util';
import { getLinkedinPersonReviews } from 'src/logic-functions/utils/get-linkedin-person-reviews.util';
import { saveLinkedinPersonReviews } from 'src/logic-functions/utils/save-linkedin-person-reviews.util';
import { setPersonLinkedinLink } from 'src/logic-functions/utils/set-person-linkedin-link.util';
import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

type LinkedinResolvePersonReviewBody = {
  handle?: unknown;
  // Omitted creates a new person
  personId?: unknown;
};

export const linkedinResolvePersonReviewHandler = async (
  routePayload: RoutePayload<LinkedinResolvePersonReviewBody>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinSettingsView> => {
  const connection = await findOwnLinkedinConnection(context);

  if (!isDefined(connection)) {
    throw new Error('Connect your LinkedIn account first.');
  }

  const { handle, personId } = routePayload.body ?? {};
  const personReviews = await getLinkedinPersonReviews(connection.id);
  const personReview = isNonEmptyString(handle)
    ? personReviews[handle]
    : undefined;

  if (!isDefined(personReview)) {
    throw new Error('This person was already reviewed.');
  }

  if (isNonEmptyString(personId)) {
    if (!personReview.candidatePersonIds.includes(personId)) {
      throw new Error('Pick one of the suggested people.');
    }

    // Setting the link makes the server attach every stored message of this participant to the person
    await setPersonLinkedinLink({ personId, handle: personReview.handle });
  } else {
    await createLinkedinPerson({
      firstName: personReview.firstName,
      lastName: personReview.lastName,
      handle: personReview.handle,
    });
  }

  const { [personReview.handle]: _resolvedPersonReview, ...remainingReviews } =
    personReviews;

  await saveLinkedinPersonReviews({
    connectedAccountId: connection.id,
    personReviews: remainingReviews,
  });

  return buildLinkedinSettingsView(connection);
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_RESOLVE_PERSON_REVIEW_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-resolve-person-review',
  description:
    'Links a LinkedIn participant that matched several People by name to the person the member picked, or creates a new one.',
  timeoutSeconds: 15,
  handler: linkedinResolvePersonReviewHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.resolvePersonReview,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
