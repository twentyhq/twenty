import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { generateWorkspaceSchemaDdl } from 'src/database/commands/workspace-export/utils/generate-workspace-schema-ddl.util';

describe('generateWorkspaceSchemaDdl', () => {
  const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const objectMetadataId = '20202020-object-id';
  const nameFieldId = '20202020-name-field-id';
  const searchVectorFieldId = '20202020-search-vector-field-id';

  const objectMetadata = {
    ...getFlatObjectMetadataMock({
      universalIdentifier: 'person',
      id: objectMetadataId,
      nameSingular: 'person',
      namePlural: 'persons',
    }),
    isActive: true,
  } as unknown as ObjectMetadataEntity;

  const nameField = getFlatFieldMetadataMock({
    universalIdentifier: 'name',
    id: nameFieldId,
    objectMetadataId,
    type: FieldMetadataType.TEXT,
    name: 'name',
  }) as unknown as FieldMetadataEntity;

  const searchVectorField = getFlatFieldMetadataMock({
    universalIdentifier: 'searchVector',
    id: searchVectorFieldId,
    objectMetadataId,
    type: FieldMetadataType.TS_VECTOR,
    name: 'searchVector',
  }) as unknown as FieldMetadataEntity;

  const fieldsByObjectId = new Map<string, FieldMetadataEntity[]>([
    [objectMetadataId, [nameField, searchVectorField]],
  ]);

  const buildSearchFieldMetadata = (
    overrides: Partial<SearchFieldMetadataEntity> = {},
  ): SearchFieldMetadataEntity =>
    ({
      universalIdentifier: 'search-name',
      objectMetadataId,
      fieldMetadataId: nameFieldId,
      tsVectorFieldMetadataId: searchVectorFieldId,
      position: 0,
      ...overrides,
    }) as SearchFieldMetadataEntity;

  const generateSearchVectorColumnSql = (
    searchFieldMetadatasByObjectId: Map<string, SearchFieldMetadataEntity[]>,
  ): string => {
    const statements = generateWorkspaceSchemaDdl(
      workspaceId,
      'workspace_schema',
      [objectMetadata],
      fieldsByObjectId,
      searchFieldMetadatasByObjectId,
    );

    const createTableStatement = statements.find((statement) =>
      statement.includes('"searchVector"'),
    );

    expect(createTableStatement).toBeDefined();

    return createTableStatement as string;
  };

  it('should emit the searchVector column as a STORED generated column derived from searchFieldMetadata', () => {
    const createTableStatement = generateSearchVectorColumnSql(
      new Map([[objectMetadataId, [buildSearchFieldMetadata()]]]),
    );

    expect(createTableStatement).toContain(
      `"searchVector" tsvector GENERATED ALWAYS AS (to_tsvector('simple', COALESCE(public.unaccent_immutable("name"), ''))) STORED`,
    );
  });

  it('should tolerate a legacy NULL tsVectorFieldMetadataId row (pre-2.18 backfill)', () => {
    const createTableStatement = generateSearchVectorColumnSql(
      new Map([
        [
          objectMetadataId,
          [
            buildSearchFieldMetadata({
              tsVectorFieldMetadataId: null as never,
            }),
          ],
        ],
      ]),
    );

    expect(createTableStatement).toContain(
      `GENERATED ALWAYS AS (to_tsvector('simple', COALESCE(public.unaccent_immutable("name"), ''))) STORED`,
    );
  });

  it('should still emit a valid STORED generated column when no searchFieldMetadata rows exist', () => {
    const createTableStatement = generateSearchVectorColumnSql(new Map());

    expect(createTableStatement).toContain(
      `"searchVector" tsvector GENERATED ALWAYS AS (to_tsvector('simple', NULL)) STORED`,
    );
  });
});
