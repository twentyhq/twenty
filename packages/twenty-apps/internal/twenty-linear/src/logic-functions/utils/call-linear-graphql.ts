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
  const response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();

    return {
      errors: [
        {
          message: `Linear API responded with ${response.status}: ${text.slice(0, 500)}`,
        },
      ],
    };
  }

  return response.json() as Promise<LinearGraphQLResult<TData>>;
};
