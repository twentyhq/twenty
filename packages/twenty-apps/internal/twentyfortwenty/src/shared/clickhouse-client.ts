import { z } from 'zod';

import { getApplicationConfig } from 'src/shared/application-config';

// Fetches rows from ClickHouse using a raw SQL query,
// parses the JSONEachRow response, and validates each row against the provided Zod schema.
export const fetchFromClickHouse = async <T>(
  query: string,
  schema: z.ZodType<T>,
): Promise<T[]> => {
  const { clickHouseUrl, clickHouseUsername, clickHousePassword } =
    getApplicationConfig();

  const response = await fetch(clickHouseUrl, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${clickHouseUsername}:${clickHousePassword}`).toString(
          'base64',
        ),
      'Content-Type': 'text/plain',
    },
    body: query,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`ClickHouse error: ${response.status} - ${errorText}`);
  }

  // Format is a list of JSON objects, one per line (JSONEachRow format).
  const text = await response.text();

  const rows = text
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));

  return z.array(schema).parse(rows);
};
