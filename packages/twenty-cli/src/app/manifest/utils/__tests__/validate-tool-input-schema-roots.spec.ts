import { describe, expect, it } from 'vitest';

import { type LogicFunctionManifest } from 'twenty-shared/application';

import { validateToolInputSchemaRoots } from '@/app/manifest/utils/validate-tool-input-schema-roots';

const buildLogicFunction = (
  overrides: Partial<LogicFunctionManifest>,
): LogicFunctionManifest => ({
  universalIdentifier: '6b4f0c43-6a0e-4d5b-9c62-8f1d1e5e2a01',
  name: 'enrich-company',
  sourceHandlerPath: 'src/enrich-company.ts',
  builtHandlerPath: 'enrich-company.mjs',
  builtHandlerChecksum: 'checksum',
  handlerName: 'handler',
  ...overrides,
});

describe('validateToolInputSchemaRoots', () => {
  it('accepts object roots, tools without a schema and non-tool functions', () => {
    expect(
      validateToolInputSchemaRoots({
        logicFunctions: [
          buildLogicFunction({
            toolTriggerSettings: {
              inputSchema: {
                type: 'object',
                properties: { domain: { type: 'string' } },
              },
            },
          }),
          buildLogicFunction({ toolTriggerSettings: {} }),
          buildLogicFunction({}),
        ],
      }),
    ).toEqual([]);
  });

  it('rejects a record root, which tools advertise as a string id', () => {
    expect(
      validateToolInputSchemaRoots({
        logicFunctions: [
          buildLogicFunction({
            toolTriggerSettings: {
              inputSchema: {
                type: 'record',
                objectUniversalIdentifier: 'company-universal-identifier',
              },
            },
          }),
        ],
      }),
    ).toEqual([
      `Logic function "enrich-company" declares a tool input schema whose root is not an object. Wrap the input in an object property, for example { type: 'object', properties: { recordId: ... } }.`,
    ]);
  });

  it('rejects array and scalar roots', () => {
    expect(
      validateToolInputSchemaRoots({
        logicFunctions: [
          buildLogicFunction({
            name: 'tag-records',
            toolTriggerSettings: {
              inputSchema: { type: 'array', items: { type: 'string' } },
            },
          }),
          buildLogicFunction({
            name: 'lookup',
            toolTriggerSettings: { inputSchema: { type: 'string' } },
          }),
        ],
      }),
    ).toEqual([
      `Logic function "tag-records" declares a tool input schema whose root is not an object. Wrap the input in an object property, for example { type: 'object', properties: { recordId: ... } }.`,
      `Logic function "lookup" declares a tool input schema whose root is not an object. Wrap the input in an object property, for example { type: 'object', properties: { recordId: ... } }.`,
    ]);
  });
});
