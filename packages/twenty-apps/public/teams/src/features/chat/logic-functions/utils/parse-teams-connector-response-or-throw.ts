import { isNonEmptyString } from '@sniptt/guards';

export const parseTeamsConnectorResponseOrThrow = <TResponse>({
  responseBody,
  method,
  path,
}: {
  responseBody: string;
  method: string;
  path: string;
}): TResponse => {
  if (!isNonEmptyString(responseBody)) {
    throw new Error(
      `Bot Connector ${method} ${path} returned an empty body where a payload was expected`,
    );
  }

  try {
    const parsedResponse: TResponse = JSON.parse(responseBody);

    return parsedResponse;
  } catch {
    throw new Error(
      `Bot Connector ${method} ${path} returned a body that is not valid JSON`,
    );
  }
};
