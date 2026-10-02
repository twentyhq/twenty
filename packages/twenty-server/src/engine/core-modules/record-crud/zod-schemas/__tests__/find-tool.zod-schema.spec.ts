import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';

const buildCompanyLikeObjectMetadata = (): ObjectMetadataForToolSchema => {
  return {
    fields: [
      {
        id: 'field-id-name',
        name: 'name',
        type: FieldMetadataType.TEXT,
        isSystem: false,
      },
      {
        id: 'field-id-address',
        name: 'address',
        type: FieldMetadataType.ADDRESS,
        isSystem: false,
      },
      {
        id: 'field-id-account-owner',
        name: 'accountOwner',
        type: FieldMetadataType.RELATION,
        isSystem: false,
        settings: { relationType: RelationType.MANY_TO_ONE },
      },
      {
        id: 'field-id-created-at',
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        isSystem: true,
      },
      {
        id: 'field-id-deleted-at',
        name: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        isSystem: true,
      },
      {
        id: 'field-id-people',
        name: 'people',
        type: FieldMetadataType.RELATION,
        isSystem: false,
        settings: { relationType: RelationType.ONE_TO_MANY },
      },
    ],
  } as unknown as ObjectMetadataForToolSchema;
};

const parseOrderBy = (orderBy: unknown, restrictedFields = {}) =>
  generateFindToolInputSchema(
    buildCompanyLikeObjectMetadata(),
    restrictedFields,
  ).safeParse({ select: ['*'], orderBy });

describe('generateFindToolInputSchema orderBy', () => {
  it.each([
    [[{ name: 'AscNullsFirst' }]],
    [[{ address: { addressCity: 'DescNullsLast' } }]],
    [[{ accountOwnerId: 'AscNullsLast' }]],
    [[{ createdAt: 'DescNullsLast' }]],
    [
      [
        { name: 'DescNullsLast' },
        { address: { addressCountry: 'AscNullsFirst' } },
      ],
    ],
  ])('accepts %j', (orderBy) => {
    expect(parseOrderBy(orderBy).success).toBe(true);
  });

  it.each([
    [[{ name: { firstName: 'AscNullsFirst' } }]],
    [[{ address: 'AscNullsFirst' }]],
    [[{ address: { unknownSubField: 'AscNullsFirst' } }]],
    [[{ people: 'AscNullsFirst' }]],
    [[{ unknownField: 'AscNullsFirst' }]],
    [[{ deletedAt: 'AscNullsFirst' }]],
    [[{ name: 'AscNullsFirst', address: { addressCity: 'AscNullsFirst' } }]],
    [[{ 'name.firstName': 'AscNullsFirst' }]],
  ])('rejects %j', (orderBy) => {
    expect(parseOrderBy(orderBy).success).toBe(false);
  });

  it('does not offer sorting on unreadable fields', () => {
    expect(
      parseOrderBy([{ name: 'AscNullsFirst' }], {
        'field-id-name': { canRead: false },
      }).success,
    ).toBe(false);
  });

  it('advertises a direction for scalar fields and sub-fields for composite fields', () => {
    type JsonSchemaNode = {
      $ref?: string;
      enum?: string[];
      properties?: Record<string, JsonSchemaNode>;
      items?: JsonSchemaNode;
    };

    const jsonSchema = toToolJsonSchema(
      generateFindToolInputSchema(buildCompanyLikeObjectMetadata()),
    ) as JsonSchemaNode & { $defs: Record<string, JsonSchemaNode> };

    const resolve = (node: JsonSchemaNode | undefined) =>
      node?.$ref ? jsonSchema.$defs[node.$ref.replace('#/$defs/', '')] : node;

    const orderByItemProperties =
      jsonSchema.properties?.orderBy.items?.properties ?? {};

    expect(resolve(orderByItemProperties.name)?.enum).toContain(
      'AscNullsFirst',
    );
    expect(resolve(orderByItemProperties.name)?.properties).toBeUndefined();
    expect(
      Object.keys(resolve(orderByItemProperties.address)?.properties ?? {}),
    ).toEqual(expect.arrayContaining(['addressCity', 'addressCountry']));
    expect(resolve(orderByItemProperties.accountOwnerId)?.enum).toContain(
      'DescNullsLast',
    );
    expect(orderByItemProperties.people).toBeUndefined();
  });
});
