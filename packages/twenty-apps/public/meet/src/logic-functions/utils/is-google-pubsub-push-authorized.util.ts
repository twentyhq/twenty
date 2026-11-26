import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { verifyGooglePubsubPushTokenOrThrow } from 'src/logic-functions/utils/verify-google-pubsub-push-token-or-throw.util';

export const isGooglePubsubPushAuthorized = async ({
  authorizationHeader,
  audience,
  serviceAccountEmail,
}: {
  authorizationHeader: string | undefined;
  audience: string;
  serviceAccountEmail: string;
}): Promise<boolean> => {
  try {
    await verifyGooglePubsubPushTokenOrThrow({
      authorizationHeader,
      audience,
      serviceAccountEmail,
    });

    return true;
  } catch (error) {
    if (
      error instanceof MeetException &&
      error.code === 'PUSH_TOKEN_INVALID'
    ) {
      return false;
    }

    throw error;
  }
};
