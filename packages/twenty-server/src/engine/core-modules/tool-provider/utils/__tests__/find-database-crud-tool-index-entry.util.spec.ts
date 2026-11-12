import { ToolCategory } from 'twenty-shared/ai';

import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { findDatabaseCrudToolIndexEntry } from 'src/engine/core-modules/tool-provider/utils/find-database-crud-tool-index-entry.util';

const buildEntry = (
  name: string,
  objectNameSingular: string,
  operation: DatabaseCrudOperation,
): ToolIndexEntry => ({
  name,
  label: name,
  description: name,
  category: ToolCategory.DATABASE_CRUD,
  executionRef: { kind: 'database_crud', objectNameSingular, operation },
});

const TOOL_INDEX: ToolIndexEntry[] = [
  buildEntry('find_many_companies', 'company', 'find_many'),
  buildEntry('update_one_company', 'company', 'update_one'),
  buildEntry('find_many_pet_care_agreements', 'petCareAgreement', 'find_many'),
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
