import { isNonEmptyString } from '@sniptt/guards';

import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const SLACK_RESPONSE_URL_ORIGIN = 'https://hooks.slack.com';

const isSlackResponseUrl = (responseUrl: string): boolean => {
  try {
    return new URL(responseUrl).origin === SLACK_RESPONSE_URL_ORIGIN;
  } catch {
    return false;
  }
};

export const updateSlackMessageViaResponseUrl = async ({
  responseUrl,
  text,
}: {
  responseUrl: string | undefined;
  text: string;
}): Promise<{ success: boolean; error?: string }> => {
  if (!isNonEmptyString(responseUrl)) {
    return {
      success: false,
      error: 'The Slack payload carried no response url.',
    };
  }

  // The payload is Slack-signed, but this is the one place the app calls a url
  // it was handed rather than one it built, so keep it on Slack's own host.
  if (!isSlackResponseUrl(responseUrl)) {
    return {
      success: false,
      error: `Refused to post to a response url outside ${SLACK_RESPONSE_URL_ORIGIN}.`,
    };
  }

  try {
    const response = await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replace_original: true, text }),
    });

    // fetch only rejects on a transport failure, so an expired or revoked
    // response url comes back as a resolved non-2xx.
    if (!response.ok) {
      return {
        success: false,
        error: `Slack rejected the message update with status ${response.status}.`,
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
};
