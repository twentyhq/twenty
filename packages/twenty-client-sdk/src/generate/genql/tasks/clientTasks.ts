import { GraphQLEnumType, GraphQLSchema, isEnumType } from 'graphql';
import camelCase from 'lodash/camelCase.js';

import { type Config } from '../config';
import { ensurePath, writeFileToPath } from '../helpers/files';
import { renderClientEsm } from '../render/client/renderClient';
import { excludedTypes } from '../render/common/excludedTypes';
import { RenderContext } from '../render/common/RenderContext';
import { renderRequestTypes } from '../render/requestTypes/renderRequestTypes';
import { renderResponseTypes } from '../render/responseTypes/renderResponseTypes';
import { renderSchema } from '../render/schema/renderSchema';
import { renderTypeGuards } from '../render/typeGuards/renderTypeGuards';
import { renderTypeMap } from '../render/typeMap/renderTypeMap';
import { RUNTIME_TEMPLATE_FILES } from '../runtime-templates';

const schemaTypesFile = 'schema.ts';
const schemaGqlFile = 'schema.graphql';
const typeMapFileEsm = 'types.ts';
const clientFileEsm = 'index.ts';

// Writes the generated client files to `config.output`. Upstream genql ran each
// write as a concurrent listr task; we run them sequentially (file contents are
// identical, and dropping listr removes a dependency).
export const writeClientFiles = async (
  config: Config,
  schema: GraphQLSchema,
): Promise<void> => {
  if (!config.output) {
    throw new Error('`output` must be defined in the config');
  }

  const output = config.output;

  await ensurePath([output], true);

  const schemaGqlCtx = new RenderContext(schema, config);
  renderSchema(schema, schemaGqlCtx);
  await writeFileToPath(
    [output, schemaGqlFile],
    await schemaGqlCtx.toCode('graphql'),
  );

  await ensurePath([output, 'runtime']);
  for (const { name, content } of RUNTIME_TEMPLATE_FILES) {
    await writeFileToPath([output, 'runtime', name], '// @ts-nocheck\n' + content);
  }

  const schemaTypesCtx = new RenderContext(schema, config);
  renderResponseTypes(schema, schemaTypesCtx);
  renderRequestTypes(schema, schemaTypesCtx);
  renderTypeGuards(schema, schemaTypesCtx);
  renderEnumsMaps(schema, schemaTypesCtx);
  await writeFileToPath(
    [output, schemaTypesFile],
    '// @ts-nocheck\n' + (await schemaTypesCtx.toCode('typescript')),
  );

  const typeMapCtx = new RenderContext(schema, config);
  renderTypeMap(schema, typeMapCtx);
  await writeFileToPath(
    [output, typeMapFileEsm],
    `export default ${await typeMapCtx.toCode()}`,
  );

  const clientCtx = new RenderContext(schema, config);
  renderClientEsm(schema, clientCtx);
  await writeFileToPath(
    [output, clientFileEsm],
    '// @ts-nocheck\n' + (await clientCtx.toCode('typescript', true)),
  );
};

function renderEnumsMaps(schema: GraphQLSchema, ctx: RenderContext) {
  let typeMap = schema.getTypeMap();

  const enums: GraphQLEnumType[] = [];
  for (const name in typeMap) {
    if (excludedTypes.includes(name)) continue;

    const type = typeMap[name];

    if (isEnumType(type)) {
      enums.push(type);
    }
  }
  if (enums.length === 0) return;

  ctx.addCodeBlock(
    enums
      .map(
        (type) =>
          `export const ${camelCase('enum' + type.name)} = {\n` +
          type
            .getValues()
            .map((v) => {
              if (!v?.name) {
                return '';
              }
              return `   ${v.name}: '${v.name}' as const`;
            })
            .join(',\n') +
          `\n}\n`,
      )
      .join('\n'),
  );
}
