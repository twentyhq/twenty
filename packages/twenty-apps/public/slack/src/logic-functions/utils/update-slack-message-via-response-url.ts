import { isNonEmptyString } from '@sniptt/guards';

export const updateSlackMessageViaResponseUrl = async ({
  responseUrl,
  text,
}: {
  responseUrl: string | undefined;
  text: string;
}): Promise<void> => {
  if (!isNonEmptyString(responseUrl)) {
    return;
  }

  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replace_original: true, text }),
    });
  } catch {}
};
