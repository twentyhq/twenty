import { isNonEmptyString } from '@sniptt/guards';

export const parseTeamsActivityId = (
  responseBody: string,
): string | undefined => {
  try {
    const parsedResponse: { id?: unknown } | null = JSON.parse(responseBody);

    return isNonEmptyString(parsedResponse?.id) ? parsedResponse.id : undefined;
  } catch {
    return undefined;
  }
};
