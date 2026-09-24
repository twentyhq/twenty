import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  graphql,
  type GraphQLNamedType,
  type GraphQLSchema,
  type IntrospectionQuery,
} from 'graphql';
import { type BuiltInParserName } from 'prettier';

import { RenderContext } from '../../genql/render/common/RenderContext';

// Port of remorses/genql@v3.0.5 cli/src/testHelpers/render.ts (minus the
// file-based typeRenderTestCase, which no ported test uses). `toCode` is
// awaited because the vendored prettify moved to prettier 3's async format.
export type TypeRenderer = (
  type: GraphQLNamedType,
  renderContext: RenderContext,
) => void;

export type SchemaRenderer = (
  schema: GraphQLSchema,
  renderContext: RenderContext,
) => void;

// Round-trips the SDL through introspection, as upstream did, so the
// renderers see a client schema exactly like one built from a real endpoint.
export const toClientSchema = async (
  schemaGql: string,
): Promise<GraphQLSchema> => {
  const schema = buildSchema(schemaGql);

  const introspectionResponse = await graphql({
    schema,
    source: getIntrospectionQuery(),
  });

  if (!introspectionResponse.data) {
    throw new Error(JSON.stringify(introspectionResponse.errors));
  }

  return buildClientSchema(
    introspectionResponse.data as unknown as IntrospectionQuery,
  );
};

export const schemaRenderTest = async (
  schemaGql: string,
  renderer: SchemaRenderer,
  parser?: BuiltInParserName,
): Promise<string> => {
  const schema = await toClientSchema(schemaGql);

  const renderContext = new RenderContext(schema);

  renderer(schema, renderContext);

  return await renderContext.toCode(parser, true);
};
