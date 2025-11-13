import axios from 'axios';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

export const fetchGraphQLSchema = async ({
  graphqlEndpoint,
  token,
  url,
}: {
  url: string;
  graphqlEndpoint: 'metadata' | 'core';
  token: string;
}): Promise<string> => {
  try {
    const client = axios.create({
      baseURL: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const introspectionQuery = getIntrospectionQuery();

    const response = await client.post(
      graphqlEndpoint === 'core' ? '' : 'metadata',
      {
        query: introspectionQuery,
      },
    );

    if (response.data.errors) {
      throw new Error(
        `GraphQL introspection errors: ${JSON.stringify(response.data.errors)}`,
      );
    }

    const schema = buildClientSchema(response.data.data);
    return printSchema(schema);
  } catch (error) {
    throw new Error(`Failed to fetch GraphQL schema: ${error}`);
  }
};
