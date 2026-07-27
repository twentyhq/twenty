type ErrorResponse = { messages?: string[]; message?: string; error?: string };

const extractErrorMessage = async (response: Response): Promise<string> => {
  const text = await response.text().catch(() => '');

  try {
    const parsed = JSON.parse(text) as ErrorResponse;
    return (
      parsed.messages?.[0] ??
      parsed.message ??
      parsed.error ??
      `Server error (${response.status})`
    );
  } catch {
    return text || `Server error (${response.status})`;
  }
};

export const callAppRoute = async (
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> => {
  const token = process.env.TWENTY_APP_ACCESS_TOKEN;

  const functionsUrl = process.env.TWENTY_FUNCTIONS_URL;
  const apiUrl = process.env.TWENTY_API_URL ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = functionsUrl ? `${functionsUrl}${normalizedPath}` : `${apiUrl}/s${normalizedPath}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
};
