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
  const apiUrl = process.env.TWENTY_API_URL;
  const token = process.env.TWENTY_APP_ACCESS_TOKEN;

  const response = await fetch(`${apiUrl}/s${path}`, {
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
