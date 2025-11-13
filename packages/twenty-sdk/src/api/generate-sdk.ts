import { generate } from '@genql/cli';
import axios, { AxiosInstance } from 'axios';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';
import path from "path";

type GenerateSdkOptions = {
  url: string;
  token: string;
  outputPath?: string;
  healthCheckPath?: string;
  maxRetries?: number;
  retryInterval?: number;
  timeout?: number;
};

const waitForServerHealth = async (
  client: AxiosInstance,
  healthCheckPath: string,
  maxRetries: number,
  retryInterval: number,
  timeout: number,
): Promise<void> => {
  const startTime = Date.now();
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await client.get(healthCheckPath, {
        timeout: 5000,
      });

      if (response.status === 200) {
        console.log(`✓ Server is healthy after ${attempt + 1} attempt(s)`);
        return;
      }
    } catch (error) {
      const elapsed = Date.now() - startTime;

      if (elapsed >= timeout) {
        throw new Error(
          `Server health check timeout after ${timeout}ms. Last error: ${error}`,
        );
      }

      attempt++;

      if (attempt < maxRetries) {
        console.log(
          `Waiting for server... (attempt ${attempt}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  throw new Error(`Server health check failed after ${maxRetries} attempts`);
};

const fetchGraphQLSchema = async (
  client: AxiosInstance,
  graphqlEndpoint: string,
  token: string,
): Promise<string> => {
  try {
    const introspectionQuery = getIntrospectionQuery();

    const response = await client.post(
      graphqlEndpoint,
      {
        query: introspectionQuery,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

export const generateSdk = async ({
  url,
  token,
  outputPath = 'src/generated/core',
  healthCheckPath = '/healthz',
  maxRetries = 600,
  retryInterval = 1000,
  timeout = 600000,
}: GenerateSdkOptions): Promise<void> => {
  try {
    const client = axios.create({
      baseURL: url,
    });

    console.log('Waiting for server to be ready...');

    await waitForServerHealth(
      client,
      healthCheckPath,
      maxRetries,
      retryInterval,
      timeout,
    );

    console.log('Fetching GraphQL schema...');

    const graphqlEndpoint = `${url}/graphql`;
    const schema = await fetchGraphQLSchema(client, graphqlEndpoint, token);

    console.log('Generating SDK...');

    await generate({
      schema,
      output: path.resolve(outputPath),
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
      verbose: true,
    });

    console.log(`✓ SDK generated successfully at ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate SDK:', error);
    throw error;
  }
};
