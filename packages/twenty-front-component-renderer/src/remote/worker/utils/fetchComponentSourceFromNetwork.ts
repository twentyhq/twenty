import { z } from 'zod';

const componentSourceHandoffSchema = z.object({ url: z.url() });

export const fetchComponentSourceFromNetwork = async ({
  url,
  headers,
}: {
  url: string;
  headers?: Record<string, string>;
}): Promise<string> => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return response.text();
  }

  const handoff = componentSourceHandoffSchema.safeParse(await response.json());

  if (!handoff.success) {
    throw new Error(`Invalid component source handoff response from ${url}`);
  }

  const presignedResponse = await fetch(handoff.data.url);

  if (!presignedResponse.ok) {
    throw new Error(
      `Failed to fetch presigned URL: ${presignedResponse.status} ${presignedResponse.statusText}`,
    );
  }

  return presignedResponse.text();
};
