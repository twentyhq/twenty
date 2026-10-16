import { build } from 'esbuild';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { describe, expect, it } from 'vitest';

import { getFieldBaseFile } from '@/app/add/entity-field-template';
import { getFrontComponentBaseFile } from '@/app/add/entity-front-component-template';
import { getLogicFunctionBaseFile } from '@/app/add/entity-logic-function-template';
import { getRecordPageLayoutBaseFile } from '@/app/add/entity-record-page-layout-template';
import { getObjectBaseFile } from '@/app/add/entity-object-template';
import { kebabCase } from '@/app/pull/kebab-case';

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

describe('app add templates', () => {
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

    expect(normalizeIdentifiers(getObjectBaseFile(input))).toMatchSnapshot();
  });

  it('preserves the record page layout and its fields view reference', () => {
    const input = {
      objectLabelSingular: 'Invoice',
      objectUniversalIdentifier: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      fieldsWidgetViewUniversalIdentifier:
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    };
    expect(
      normalizeIdentifiers(getRecordPageLayoutBaseFile(input)),
    ).toMatchSnapshot();
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

      expect(normalizeIdentifiers(getFieldBaseFile(input))).toMatchSnapshot();
    },
  );

  it.each(['SendInvoice', 'hello world', 'HTTPClient2'])(
    'preserves runtime templates and filename normalization for %s',
    (name) => {
      expect(kebabCase(name)).toMatchSnapshot();
      expect(
        normalizeIdentifiers(getLogicFunctionBaseFile({ name })),
      ).toMatchSnapshot();
      expect(
        normalizeIdentifiers(getFrontComponentBaseFile({ name })),
      ).toMatchSnapshot();
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
