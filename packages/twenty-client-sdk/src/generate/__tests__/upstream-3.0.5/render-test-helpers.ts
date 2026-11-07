import {
  buildClientSchema,
  buildSchema,
  type GraphQLNamedType,
  type GraphQLSchema,
  introspectionFromSchema,
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
): Promise<GraphQLSchema> =>
  buildClientSchema(introspectionFromSchema(buildSchema(schemaGql)));

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
