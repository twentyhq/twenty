import {
  FIELD_ENUM_BINDINGS,
  INDEX_ENUM_BINDINGS,
  OBJECT_ENUM_BINDINGS,
  writeDefineFile,
} from '@/cli/utilities/pull/write-define-file';
import { describe, expect, it } from 'vitest';

describe('writeDefineFile', () => {
  it('should write an enum-valued property as a symbol and import it', () => {
    const file = writeDefineFile({
      definer: 'defineField',
      config: {
        universalIdentifier: 'field-uid',
        type: 'TEXT',
        name: 'title',
        writability: 'OPEN',
      },
      enumBindings: FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain(
      "import { defineField, FieldType, MetadataWritability } from 'twenty-sdk/define';",
    );
    expect(file).toContain('type: FieldType.TEXT,');
    expect(file).toContain('writability: MetadataWritability.OPEN,');
  });

  it('should look up an enum member whose name differs from its value', () => {
    const file = writeDefineFile({
      definer: 'defineField',
      config: {
        universalIdentifier: 'field-uid',
        type: 'NUMBER',
        universalSettings: { dataType: 'bigint' },
      },
      enumBindings: FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain('dataType: NumberDataType.BIGINT,');
  });

  it('should leave a string that is not a member of the bound enum as a literal', () => {
    const file = writeDefineFile({
      definer: 'defineField',
      config: { universalIdentifier: 'field-uid', type: 'NOT_A_FIELD_TYPE' },
      enumBindings: FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain("type: 'NOT_A_FIELD_TYPE',");
    expect(file).toContain("import { defineField } from 'twenty-sdk/define';");
  });

  it('should only bind enum properties at the declared path', () => {
    const file = writeDefineFile({
      definer: 'defineIndex',
      config: {
        universalIdentifier: 'index-uid',
        indexType: 'BTREE',
        fields: [{ fieldUniversalIdentifier: 'field-uid', indexType: 'BTREE' }],
      },
      enumBindings: INDEX_ENUM_BINDINGS,
    });

    expect(file).toContain('indexType: IndexType.BTREE,');
    expect(file).toContain("indexType: 'BTREE',");
  });

  it('should wrap the import statement when it grows past one line', () => {
    const file = writeDefineFile({
      definer: 'defineObject',
      config: {
        writability: 'OPEN',
        openRecordIn: 'USER_CHOICE',
        fields: [
          {
            type: 'RELATION',
            universalSettings: {
              relationType: 'MANY_TO_ONE',
              onDelete: 'SET_NULL',
            },
          },
        ],
      },
      enumBindings: OBJECT_ENUM_BINDINGS,
    });

    expect(file.startsWith('import {\n  defineObject,\n')).toBe(true);
    expect(file).toContain("} from 'twenty-sdk/define';");
    expect(file).toContain('relationType: RelationType.MANY_TO_ONE,');
    expect(file).toContain('onDelete: OnDeleteAction.SET_NULL,');
  });

  it('should quote a key that is not a valid identifier and escape strings', () => {
    const file = writeDefineFile({
      definer: 'defineApplication',
      config: {
        displayName: "Tim's app",
        translations: { 'fr-FR': { greeting: 'Bonjour' } },
        nothing: null,
        empty: [],
      },
    });

    expect(file).toContain("displayName: 'Tim\\'s app',");
    expect(file).toContain("'fr-FR': {");
    expect(file).toContain('nothing: null,');
    expect(file).toContain('empty: [],');
  });

  it('should end with a single default export of the definer call', () => {
    const file = writeDefineFile({
      definer: 'defineObject',
      config: { nameSingular: 'pet' },
    });

    expect(file).toBe(
      "import { defineObject } from 'twenty-sdk/define';\n" +
        '\n' +
        'export default defineObject({\n' +
        "  nameSingular: 'pet',\n" +
        '});\n',
    );
  });
});
