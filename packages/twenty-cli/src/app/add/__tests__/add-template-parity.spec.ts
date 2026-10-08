import { mkdtemp, rm, symlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getFieldBaseFile } from '@/app/add/entity-field-template';
import { getFrontComponentBaseFile } from '@/app/add/entity-front-component-template';
import { getLogicFunctionBaseFile } from '@/app/add/entity-logic-function-template';
import { getRecordPageLayoutBaseFile } from '@/app/add/entity-record-page-layout-template';
import { getObjectBaseFile } from '@/app/add/entity-object-template';
import { kebabCase } from '@/app/pull/kebab-case';

const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g;
const normalizeIdentifiers = (content: string) => {
  const identifiers = new Map<string, number>();

  return content.replace(UUID_PATTERN, (identifier) => {
    if (!identifiers.has(identifier))
      identifiers.set(identifier, identifiers.size);

    return `UUID_${identifiers.get(identifier)}`;
  });
};

type SdkReference = {
  getFieldBaseFile: typeof getFieldBaseFile;
  getFrontComponentBaseFile: typeof getFrontComponentBaseFile;
  getLogicFunctionBaseFile: typeof getLogicFunctionBaseFile;
  getObjectBaseFile: typeof getObjectBaseFile;
  getRecordPageLayoutBaseFile: typeof getRecordPageLayoutBaseFile;
  kebabCase: typeof kebabCase;
};

describe('app add template parity with the repository SDK', () => {
  let root: string;
  let sdk: SdkReference;

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-add-parity-'));
    await symlink(
      join(REPOSITORY_ROOT, 'node_modules'),
      join(root, 'node_modules'),
    );
    const sdkSource = join(REPOSITORY_ROOT, 'packages/twenty-sdk/src');
    const oraclePath = join(root, 'sdk.cjs');

    await build({
      stdin: {
        contents: [
          ...[
            'object',
            'field',
            'logic-function',
            'front-component',
            'record-page-layout',
          ].map(
            (entity) =>
              `export * from './cli/utilities/entity/entity-${entity}-template';`,
          ),
          "export * from './cli/utilities/string/kebab-case';",
        ].join('\n'),
        resolveDir: sdkSource,
      },
      outfile: oraclePath,
      alias: { '@': sdkSource },
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      target: 'node24',
    });
    sdk = createRequire(import.meta.url)(oraclePath) as SdkReference;
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('preserves the object template and its shared name-field identifier', () => {
    const input = {
      name: 'invoice',
      data: {
        nameSingular: 'invoice',
        namePlural: 'invoices',
        labelSingular: 'Invoice',
        labelPlural: 'Invoices',
      },
    };

    expect(normalizeIdentifiers(getObjectBaseFile(input))).toBe(
      normalizeIdentifiers(sdk.getObjectBaseFile(input)),
    );
  });

  it('preserves the SDK record page layout and its fields view reference', () => {
    const input = {
      objectLabelSingular: 'Invoice',
      objectUniversalIdentifier: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      fieldsWidgetViewUniversalIdentifier:
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    };
    expect(normalizeIdentifiers(getRecordPageLayoutBaseFile(input))).toBe(
      normalizeIdentifiers(sdk.getRecordPageLayoutBaseFile(input)),
    );
  });

  it.each(Object.values(FieldMetadataType))(
    'preserves the %s field template',
    (type) => {
      const input = {
        name: 'value',
        data: {
          name: 'value',
          label: 'Value',
          type,
          objectUniversalIdentifier: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          description: 'A value',
          relationTargetObjectMetadataUniversalIdentifier:
            'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          relationTargetFieldMetadataUniversalIdentifier:
            'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          relationType: RelationType.ONE_TO_MANY,
          onDelete: RelationOnDeleteAction.CASCADE,
        },
      };

      expect(normalizeIdentifiers(getFieldBaseFile(input))).toBe(
        normalizeIdentifiers(sdk.getFieldBaseFile(input)),
      );
    },
  );

  it.each(['SendInvoice', 'hello world', 'HTTPClient2'])(
    'preserves runtime templates and SDK filename normalization for %s',
    (name) => {
      expect(kebabCase(name)).toBe(sdk.kebabCase(name));
      expect(normalizeIdentifiers(getLogicFunctionBaseFile({ name }))).toBe(
        normalizeIdentifiers(sdk.getLogicFunctionBaseFile({ name })),
      );
      expect(normalizeIdentifiers(getFrontComponentBaseFile({ name }))).toBe(
        normalizeIdentifiers(sdk.getFrontComponentBaseFile({ name })),
      );
    },
  );

  it('escapes authored strings instead of emitting invalid TypeScript', async () => {
    const label = "Customer's \\ invoice\nnext line";
    const object = getObjectBaseFile({
      name: 'invoice',
      data: {
        nameSingular: 'invoice',
        namePlural: 'invoices',
        labelSingular: label,
        labelPlural: label,
      },
    });
    const field = getFieldBaseFile({
      name: 'amount',
      data: {
        name: 'amount',
        label,
        type: FieldMetadataType.NUMBER,
        objectUniversalIdentifier: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        description: label,
      },
    });

    const layout = getRecordPageLayoutBaseFile({
      objectLabelSingular: label,
      objectUniversalIdentifier: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      fieldsWidgetViewUniversalIdentifier:
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    });

    for (const source of [object, field, layout]) {
      expect(source).toContain("Customer\\'s \\\\ invoice\\nnext line");
      const result = await build({
        stdin: { contents: source, loader: 'ts' },
        write: false,
        bundle: true,
        external: ['twenty-sdk/define'],
        platform: 'node',
      });

      expect(result.errors).toEqual([]);
    }
  });
});
