import { ToolCategory } from 'twenty-shared/ai';

import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { findDatabaseCrudToolIndexEntry } from 'src/engine/core-modules/tool-provider/utils/find-database-crud-tool-index-entry.util';

const buildEntry = ({
  name,
  objectNameSingular,
  operation,
}: {
  name: string;
  objectNameSingular: string;
  operation: DatabaseCrudOperation;
}): ToolIndexEntry => ({
  name,
  label: name,
  description: name,
  category: ToolCategory.DATABASE_CRUD,
  executionRef: { kind: 'database_crud', objectNameSingular, operation },
});

const TOOL_INDEX: ToolIndexEntry[] = [
  buildEntry({
    name: 'find_many_companies',
    objectNameSingular: 'company',
    operation: 'find_many',
  }),
  buildEntry({
    name: 'update_one_company',
    objectNameSingular: 'company',
    operation: 'update_one',
  }),
  buildEntry({
    name: 'find_many_pet_care_agreements',
    objectNameSingular: 'petCareAgreement',
    operation: 'find_many',
  }),
  {
    name: 'send_email',
    label: 'Send email',
    description: 'Send email',
    category: ToolCategory.ACTION,
    executionRef: { kind: 'static', toolId: 'send_email' },
  },
];

describe('findDatabaseCrudToolIndexEntry', () => {
  it.each([
    ['company'],
    ['companies'],
    ['Company'],
    ['petCareAgreement'],
    ['pet_care_agreements'],
  ])('should resolve the object named %p', (objectName) => {
    const lookup = findDatabaseCrudToolIndexEntry({
      toolIndex: TOOL_INDEX,
      objectName,
      operation: 'find_many',
    });

    expect(lookup.status).toBe('found');
  });

  it('should resolve a singular-named operation from the plural name', () => {
    expect(
      findDatabaseCrudToolIndexEntry({
        toolIndex: TOOL_INDEX,
        objectName: 'companies',
        operation: 'update_one',
      }),
    ).toEqual({ status: 'found', entry: TOOL_INDEX[1] });
  });

  it('should report an operation the caller cannot run on a known object', () => {
    expect(
      findDatabaseCrudToolIndexEntry({
        toolIndex: TOOL_INDEX,
        objectName: 'company',
        operation: 'delete_many',
      }),
    ).toEqual({
      status: 'operationNotAvailable',
      objectNameSingular: 'company',
    });
  });

  it('should suggest close object names for an unknown object', () => {
    expect(
      findDatabaseCrudToolIndexEntry({
        toolIndex: TOOL_INDEX,
        objectName: 'compnies',
        operation: 'find_many',
      }),
    ).toEqual({
      status: 'objectNotFound',
      similarObjectNames: ['companies', 'company'],
    });
  });

  describe('objects whose names differ only by case', () => {
    const toolIndex = [
      buildEntry({
        name: 'find_many_foo_bars',
        objectNameSingular: 'fooBar',
        operation: 'find_many',
      }),
      buildEntry({
        name: 'find_many_foobars',
        objectNameSingular: 'foobar',
        operation: 'find_many',
      }),
    ];

    it('should resolve the exactly named object', () => {
      for (const [objectName, entry] of [
        ['fooBar', toolIndex[0]],
        ['foobar', toolIndex[1]],
        ['foobars', toolIndex[1]],
      ] as const) {
        expect(
          findDatabaseCrudToolIndexEntry({
            toolIndex,
            objectName,
            operation: 'find_many',
          }),
        ).toEqual({ status: 'found', entry });
      }
    });

    it('should not guess when the name matches several objects loosely', () => {
      expect(
        findDatabaseCrudToolIndexEntry({
          toolIndex,
          objectName: 'FOOBAR',
          operation: 'find_many',
        }),
      ).toEqual({
        status: 'objectNotFound',
        similarObjectNames: ['fooBar', 'foobar'],
      });
    });
  });

  it('should not match tools that are not record operations', () => {
    expect(
      findDatabaseCrudToolIndexEntry({
        toolIndex: TOOL_INDEX,
        objectName: 'email',
        operation: 'find_many',
      }).status,
    ).toBe('objectNotFound');
  });
});
