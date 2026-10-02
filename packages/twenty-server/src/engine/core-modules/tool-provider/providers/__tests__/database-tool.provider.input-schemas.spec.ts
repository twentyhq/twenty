import { type JSONSchema7 } from 'json-schema';
import {
  FieldMetadataType,
  NumberDataType,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { type ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Snapshots every database tool input schema for an object covering all field types,
// so any change to the generated schemas shows up as a reviewable diff. $refs are inlined
// since only the resolved schema matters to callers; the recursive record filter is
// snapshotted once per tool and marked where it is referenced.

const workspaceId = 'workspace-id';
const roleId = 'role-id';
const objectMetadataId = 'object-metadata-id';
const applicationUniversalIdentifier =
  'custom-application-universal-identifier';

const SELECT_OPTIONS = [
  { id: 'option-new', value: 'NEW', label: 'New', color: 'blue', position: 0 },
  { id: 'option-won', value: 'WON', label: 'Won', color: 'green', position: 1 },
];

const RATING_OPTIONS = [
  { id: 'rating-1', value: 'RATING_1', label: '1', position: 0 },
  { id: 'rating-2', value: 'RATING_2', label: '2', position: 1 },
];

const FIELD_DEFINITIONS: Array<Partial<FlatFieldMetadata>> = [
  {
    name: 'id',
    type: FieldMetadataType.UUID,
    isNullable: false,
    isSystem: true,
  },
  {
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    isNullable: false,
    isSystem: true,
  },
  {
    name: 'updatedAt',
    type: FieldMetadataType.DATE_TIME,
    isNullable: false,
    isSystem: true,
  },
  { name: 'deletedAt', type: FieldMetadataType.DATE_TIME, isSystem: true },
  {
    name: 'createdBy',
    type: FieldMetadataType.ACTOR,
    isNullable: false,
    isSystem: true,
  },
  {
    name: 'position',
    type: FieldMetadataType.POSITION,
    isNullable: false,
    isSystem: true,
  },
  { name: 'searchVector', type: FieldMetadataType.TS_VECTOR, isSystem: true },
  {
    name: 'name',
    type: FieldMetadataType.TEXT,
    isNullable: false,
    description: 'Deal name',
  },
  { name: 'notes', type: FieldMetadataType.RICH_TEXT },
  { name: 'seats', type: FieldMetadataType.NUMBER },
  {
    name: 'probability',
    type: FieldMetadataType.NUMBER,
    settings: { dataType: NumberDataType.FLOAT, decimals: 2 },
  },
  { name: 'score', type: FieldMetadataType.NUMERIC },
  { name: 'isPriority', type: FieldMetadataType.BOOLEAN },
  { name: 'closeDate', type: FieldMetadataType.DATE },
  { name: 'lastContactAt', type: FieldMetadataType.DATE_TIME },
  { name: 'stage', type: FieldMetadataType.SELECT, options: SELECT_OPTIONS },
  { name: 'emptySelect', type: FieldMetadataType.SELECT, options: [] },
  {
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    options: SELECT_OPTIONS,
  },
  { name: 'rating', type: FieldMetadataType.RATING, options: RATING_OPTIONS },
  {
    name: 'externalId',
    type: FieldMetadataType.UUID,
    description: 'External id',
  },
  { name: 'payload', type: FieldMetadataType.RAW_JSON },
  { name: 'aliases', type: FieldMetadataType.ARRAY },
  { name: 'attachments', type: FieldMetadataType.FILES },
  { name: 'reviewer', type: FieldMetadataType.ACTOR },
  { name: 'website', type: FieldMetadataType.LINKS, description: 'Website' },
  { name: 'amount', type: FieldMetadataType.CURRENCY, isNullable: false },
  { name: 'contactName', type: FieldMetadataType.FULL_NAME },
  { name: 'address', type: FieldMetadataType.ADDRESS },
  { name: 'emails', type: FieldMetadataType.EMAILS },
  { name: 'phones', type: FieldMetadataType.PHONES },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    isNullable: false,
    settings: { relationType: RelationType.MANY_TO_ONE },
  },
  {
    name: 'pointOfContact',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
  },
  {
    name: 'tasks',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.ONE_TO_MANY },
  },
  {
    name: 'targetPerson',
    type: FieldMetadataType.MORPH_RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
  },
];

const buildFields = (): FlatFieldMetadata[] =>
  FIELD_DEFINITIONS.map((definition) =>
    getFlatFieldMetadataMock({
      description: null,
      isNullable: true,
      ...definition,
      id: `field-${definition.name}`,
      universalIdentifier: `field-${definition.name}`,
      objectMetadataId,
      type: definition.type as FieldMetadataType,
      workspaceId,
      applicationUniversalIdentifier,
    }),
  );

const isRecordFilterDefinition = (definition: unknown) => {
  const properties = (definition as { properties?: Record<string, unknown> })
    ?.properties;

  return isDefined(properties?.or) && isDefined(properties?.not);
};

const sortKeys = (entries: [string, unknown][]) =>
  Object.fromEntries(
    entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  );

// Tools taking filters as top-level arguments repeat the record filter's properties
const pointTopLevelFiltersToRecordFilter = (
  inputSchema: JSONSchema7,
  recordFilter: JSONSchema7 | undefined,
): JSONSchema7 => ({
  ...inputSchema,
  properties: Object.fromEntries(
    Object.entries(inputSchema.properties ?? {}).map(([key, value]) => [
      key,
      isDefined(recordFilter?.properties?.[key]) &&
      JSON.stringify(recordFilter.properties[key]) === JSON.stringify(value)
        ? `same as recordFilter.properties.${key}`
        : value,
    ]),
  ) as JSONSchema7['properties'],
});

const inlineReferences = (
  node: unknown,
  definitions: Record<string, unknown>,
): unknown => {
  if (Array.isArray(node)) {
    return node.map((item) => inlineReferences(item, definitions));
  }

  if (node === null || typeof node !== 'object') {
    return node;
  }

  const {
    $ref,
    $defs: _definitions,
    ...siblings
  } = node as Record<string, unknown>;

  const inlinedSiblings = sortKeys(
    Object.entries(siblings)
      // Zod emitted a redundant pattern next to some formats; the format carries the constraint
      .filter(([key]) => !(key === 'pattern' && 'format' in siblings))
      .map(([key, value]) => [
        key,
        key === 'required' && Array.isArray(value)
          ? [...value].sort()
          : inlineReferences(value, definitions),
      ]),
  );

  if (typeof $ref !== 'string') {
    return inlinedSiblings;
  }

  const definition = definitions[$ref.replace('#/$defs/', '')];

  if (isRecordFilterDefinition(definition)) {
    return sortKeys(Object.entries({ ...inlinedSiblings, recordFilter: true }));
  }

  return sortKeys(
    Object.entries({
      ...(inlineReferences(definition, definitions) as Record<string, unknown>),
      ...inlinedSiblings,
    }),
  );
};

const generateInputSchemas = async (
  restrictedFields: Record<string, { canRead?: boolean; canUpdate?: boolean }>,
): Promise<InlinedToolSchemas> => {
  const fields = buildFields();

  const flatObject: FlatObjectMetadata = getFlatObjectMetadataMock({
    id: objectMetadataId,
    universalIdentifier: objectMetadataId,
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    labelSingular: 'Opportunity',
    labelPlural: 'Opportunities',
    fieldIds: fields.map((field) => field.id),
  });

  const flatObjectMetadataMaps =
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>;

  flatObjectMetadataMaps.byUniversalIdentifier[flatObject.universalIdentifier] =
    flatObject;
  flatObjectMetadataMaps.universalIdentifierById[flatObject.id] =
    flatObject.universalIdentifier;

  const flatFieldMetadataMaps =
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>;

  for (const field of fields) {
    flatFieldMetadataMaps.byUniversalIdentifier[field.universalIdentifier] =
      field;
    flatFieldMetadataMaps.universalIdentifierById[field.id] =
      field.universalIdentifier;
  }

  const provider = new DatabaseToolProvider(
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        rolesPermissions: {
          [roleId]: {
            [objectMetadataId]: {
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
              restrictedFields,
              rowLevelPermissionPredicates: [],
              rowLevelPermissionPredicateGroups: [],
            },
          },
        },
        flatObjectPermissionMaps: { byUniversalIdentifier: {} },
      }),
    } as unknown as WorkspaceCacheService,
    {
      getOrRecomputeManyOrAllFlatEntityMaps: jest
        .fn()
        .mockResolvedValue({ flatObjectMetadataMaps, flatFieldMetadataMaps }),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    {
      translateMessage: ({ messageId }: { messageId: string }) => messageId,
      getI18nInstance: () => ({
        _: (descriptor: string | { id: string; message?: string }) =>
          typeof descriptor === 'string'
            ? descriptor
            : (descriptor.message ?? descriptor.id),
      }),
    } as unknown as I18nService,
    {
      getApplicationAuthorIdentifiers: jest.fn().mockResolvedValue({
        standardApplicationId: 'standard-application-id',
        workspaceCustomApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        universalIdentifierByApplicationId: {},
      }),
    } as unknown as ApplicationTranslationCatalogService,
  );

  const descriptors = await provider.generateDescriptors(
    { workspaceId, roleId, rolePermissionConfig: { unionOf: [roleId] } },
    { includeSchemas: true },
  );

  return Object.fromEntries(
    descriptors.map((descriptor) => {
      const inputSchema =
        'inputSchema' in descriptor ? descriptor.inputSchema : {};
      const definitions =
        (inputSchema as { $defs?: Record<string, unknown> }).$defs ?? {};
      const recordFilter = Object.values(definitions).find(
        isRecordFilterDefinition,
      );

      const inlinedRecordFilter = isDefined(recordFilter)
        ? (inlineReferences(recordFilter, definitions) as JSONSchema7)
        : undefined;

      return [
        descriptor.name,
        {
          inputSchema: pointTopLevelFiltersToRecordFilter(
            inlineReferences(inputSchema, definitions) as JSONSchema7,
            inlinedRecordFilter,
          ),
          ...(isDefined(inlinedRecordFilter) && {
            recordFilter: inlinedRecordFilter,
          }),
        },
      ];
    }),
  );
};

type InlinedToolSchemas = Record<
  string,
  { inputSchema: JSONSchema7; recordFilter?: JSONSchema7 }
>;

// find_many, group_by and delete_many share the same record filter
const pointSharedRecordFiltersToFirstTool = (
  inputSchemas: InlinedToolSchemas,
) => {
  const toolNameByRecordFilter = new Map<string, string>();

  return Object.fromEntries(
    Object.entries(inputSchemas).map(([toolName, toolSchemas]) => {
      if (!isDefined(toolSchemas.recordFilter)) {
        return [toolName, toolSchemas];
      }

      const serializedRecordFilter = JSON.stringify(toolSchemas.recordFilter);
      const firstToolName = toolNameByRecordFilter.get(serializedRecordFilter);

      if (!isDefined(firstToolName)) {
        toolNameByRecordFilter.set(serializedRecordFilter, toolName);

        return [toolName, toolSchemas];
      }

      return [
        toolName,
        { ...toolSchemas, recordFilter: `same as ${firstToolName}` },
      ];
    }),
  );
};

const getPropertyNames = (schema: JSONSchema7 | undefined) =>
  Object.keys(schema?.properties ?? {}).sort();

describe('DatabaseToolProvider input schemas', () => {
  it('should generate the input schema of every database tool', async () => {
    const inputSchemas = pointSharedRecordFiltersToFirstTool(
      await generateInputSchemas({}),
    );

    for (const [toolName, toolSchemas] of Object.entries(inputSchemas)) {
      expect(toolSchemas).toMatchSnapshot(toolName);
    }
  });

  it('should leave restricted fields out of the input schemas', async () => {
    const inputSchemas = await generateInputSchemas({
      'field-name': { canRead: false },
      'field-amount': { canUpdate: false },
      'field-company': { canRead: false, canUpdate: false },
    });

    const findMany = inputSchemas.find_many_opportunities;
    const groupBy = inputSchemas.group_by_opportunities.inputSchema.properties
      ?.groupBy as JSONSchema7;

    expect({
      findManyArguments: getPropertyNames(findMany.inputSchema),
      recordFilter: getPropertyNames(findMany.recordFilter),
      orderBy: getPropertyNames(
        (findMany.inputSchema.properties?.orderBy as JSONSchema7)
          .items as JSONSchema7,
      ),
      groupBy: ((groupBy.items as JSONSchema7).anyOf ?? []).map(
        (entry) => getPropertyNames(entry as JSONSchema7)[0],
      ),
      createOne: getPropertyNames(
        inputSchemas.create_one_opportunity.inputSchema,
      ),
      updateManyData: getPropertyNames(
        inputSchemas.update_many_opportunities.inputSchema.properties
          ?.data as JSONSchema7,
      ),
    }).toMatchSnapshot();
  });
});
