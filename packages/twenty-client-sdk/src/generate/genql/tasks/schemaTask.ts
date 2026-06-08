import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import {
  assertValidSchema,
  GraphQLSchema,
  lexicographicSortSchema,
} from 'graphql';

import { type Config } from '../config';

// Loads the schema from the config string. The upstream genql codegen also
// supported fetching the schema from a live endpoint (via undici/native-fetch);
// Twenty always passes an SDL string, so that path is intentionally dropped.
export const loadConfiguredSchema = async (
  config: Config,
): Promise<GraphQLSchema> => {
  if (!config.schema) {
    throw new Error('`schema` must be defined in the config');
  }

  const document = await loadSchema(config.schema, {
    loaders: [new GraphQLFileLoader()],
  });

  const schema = config.sortProperties
    ? lexicographicSortSchema(document)
    : document;

  try {
    assertValidSchema(schema);
  } catch (e) {
    // A schema without a Query root is still renderable (e.g. metadata-only),
    // matching upstream genql behaviour.
    if (e && (e as Error).message === 'Query root type must be provided.') {
      return schema;
    }
    throw e;
  }

  return schema;
};
