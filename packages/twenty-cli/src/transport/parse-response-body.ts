import { CliError } from '@/output/cli-error';

const JSON_CONTENT_TYPE_PATTERN = /^application\/([\w.+-]+\+)?json/i;

const TEXT_CONTENT_TYPE_PATTERN =
  /^(text\/|application\/([\w.+-]+\+)?(json|xml)|application\/javascript)/i;

export const parseResponseBody = async (
  response: Response,
): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType !== '' && !TEXT_CONTENT_TYPE_PATTERN.test(contentType)) {
    throw new CliError({
      code: 'UNSUPPORTED_RESPONSE_TYPE',
      message: `The response is ${contentType}, and binary bodies are not supported yet.`,
      details: { status: response.status, contentType },
    });
  }

  const text = await response.text();

  if (text === '') {
    return null;
  }

  if (!JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
