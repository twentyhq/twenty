import {
  assertValidSchema,
  buildSchema,
  GraphQLSchema,
  lexicographicSortSchema,
} from 'graphql';

import { type Config } from '../config';

// Builds the schema from the config SDL string. The upstream genql codegen used
// @graphql-tools' loadSchema and also supported fetching the schema from a live
// endpoint (via undici/native-fetch). Twenty always passes an SDL string, so we
// build it directly with graphql's buildSchema — no @graphql-tools or network.
export const loadConfiguredSchema = async (
  config: Config,
): Promise<GraphQLSchema> => {
  if (!config.schema) {
    throw new Error('`schema` must be defined in the config');
  }

  const document = buildSchema(config.schema, { assumeValidSDL: true });

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
