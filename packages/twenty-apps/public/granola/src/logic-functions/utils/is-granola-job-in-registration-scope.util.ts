import { isDefined } from 'twenty-sdk/utils';

import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';

export const isGranolaJobInRegistrationScope = ({
  registration,
  registrationId,
  folderId,
}: {
  registration:
    | Pick<
        GranolaWebhookRegistration,
        'isActive' | 'registrationId' | 'folderIds'
      >
    | undefined;
  registrationId: string;
  folderId: string | undefined;
}): boolean =>
  isDefined(registration) &&
  registration.isActive &&
  registration.registrationId === registrationId &&
  (registration.folderIds.length === 0 ||
    (isDefined(folderId) && registration.folderIds.includes(folderId)));
