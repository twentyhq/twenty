import { isNonEmptyString } from '@sniptt/guards';

// Slack gives every interactivity payload a short-lived response_url that
// accepts an unauthenticated POST to replace the message the button lived on.
export const updateSlackMessageViaResponseUrl = async (
  responseUrl: string | undefined,
  text: string,
): Promise<void> => {
  if (!isNonEmptyString(responseUrl)) {
    return;
  }

  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replace_original: true, text }),
    });
  } catch {
    // A failed message refresh must not fail the consent decision itself.
  }
};
