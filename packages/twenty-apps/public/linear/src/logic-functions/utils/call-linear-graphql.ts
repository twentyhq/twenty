import { type LinearGraphQLResult } from 'src/logic-functions/utils/types/linear-graphql-result.type';

const LINEAR_GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql';

export const callLinearGraphQL = async <TData>({
  accessToken,
  query,
  variables,
}: {
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}): Promise<LinearGraphQLResult<TData>> => {
  let response: Response;

  try {
    response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (error) {
    return {
      errors: [
        {
          message: `Linear API request failed: ${(error as Error).message}`,
        },
      ],
    };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    return {
      errors: [
        {
          message: `Linear API responded with ${response.status}: ${text.slice(0, 500)}`,
        },
      ],
    };
  }

  try {
    return (await response.json()) as LinearGraphQLResult<TData>;
  } catch (error) {
    return {
      errors: [
        {
          message: `Linear API returned a non-JSON response: ${(error as Error).message}`,
        },
      ],
    };
  }
};
