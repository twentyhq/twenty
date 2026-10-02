import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { NavigateAppTool } from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-1';
const USER_WORKSPACE_ID = 'user-workspace-1';
const CANDIDATE_LIMIT = 20;

// The fake records service below ignores the auth context; it is only checked for being forwarded as is
const CALLER_AUTH_CONTEXT = buildSystemAuthContext(WORKSPACE_ID);

const CALLER_ROLE_PERMISSION_CONFIG: RolePermissionConfig = {
  intersectionOf: ['member-role', 'agent-role'],
};

const TOOL_CONTEXT: ToolExecutionContext = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
  authContext: CALLER_AUTH_CONTEXT,
  rolePermissionConfig: CALLER_ROLE_PERMISSION_CONFIG,
};

const buildFlatEntityMaps = (
  entities: { id: string; universalIdentifier: string }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const COMPANY_OBJECT = {
  id: 'company-object-id',
  universalIdentifier: 'company-object-universal-identifier',
  applicationUniversalIdentifier: 'twenty-standard',
  nameSingular: 'company',
  isActive: true,
  labelIdentifierFieldMetadataId: 'company-name-field-id',
};

const PERSON_OBJECT = {
  id: 'person-object-id',
  universalIdentifier: 'person-object-universal-identifier',
  applicationUniversalIdentifier: 'twenty-standard',
  nameSingular: 'person',
  isActive: true,
  labelIdentifierFieldMetadataId: 'person-name-field-id',
};

const COMPANY_NAME_FIELD = {
  id: 'company-name-field-id',
  universalIdentifier: 'company-name-field-universal-identifier',
  name: 'name',
  type: FieldMetadataType.TEXT,
};

const PERSON_NAME_FIELD = {
  id: 'person-name-field-id',
  universalIdentifier: 'person-name-field-universal-identifier',
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
};

const buildObjectPermissions = (
  restrictedFields: Record<string, { canRead: boolean; canUpdate: boolean }>,
) => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields,
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

const buildRolesPermissions = (
  memberRoleRestrictedFields: Record<
    string,
    { canRead: boolean; canUpdate: boolean }
  > = {},
) => ({
  'member-role': {
    [COMPANY_OBJECT.id]: buildObjectPermissions(memberRoleRestrictedFields),
    [PERSON_OBJECT.id]: buildObjectPermissions({}),
  },
  'agent-role': {
    [COMPANY_OBJECT.id]: buildObjectPermissions({}),
    [PERSON_OBJECT.id]: buildObjectPermissions({}),
  },
});

type FullName = { firstName: string; lastName: string };

type FakeRecord = { id: string; name: string | FullName };

const getDisplayName = (record: FakeRecord) =>
  typeof record.name === 'string'
    ? record.name
    : `${record.name.firstName} ${record.name.lastName}`.trim();

const ilikePatternToRegExp = (pattern: string) => {
  let source = '';

  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];

    if (character === '\\') {
      index++;
      source += pattern[index].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    } else if (character === '%') {
      source += '.*';
    } else if (character === '_') {
      source += '.';
    } else {
      source += character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }

  return new RegExp(`^${source}$`, 'i');
};

const matchesOperator = (value: string, condition: Record<string, string>) => {
  if (isDefined(condition.ilike)) {
    return ilikePatternToRegExp(condition.ilike).test(value);
  }

  if (isDefined(condition.eq)) {
    return value === condition.eq;
  }

  throw new Error(`Unsupported condition ${JSON.stringify(condition)}`);
};

const matchesFilter = (
  record: FakeRecord,
  filter: Record<string, unknown>,
): boolean =>
  Object.entries(filter).every(([key, value]) => {
    if (key === 'and') {
      return (value as Record<string, unknown>[]).every((subFilter) =>
        matchesFilter(record, subFilter),
      );
    }

    if (key === 'or') {
      return (value as Record<string, unknown>[]).some((subFilter) =>
        matchesFilter(record, subFilter),
      );
    }

    if (key === 'id') {
      return matchesOperator(record.id, value as Record<string, string>);
    }

    if (typeof record.name === 'string') {
      return matchesOperator(record.name, value as Record<string, string>);
    }

    const fullName = record.name;

    return Object.entries(
      value as Record<keyof FullName, Record<string, string>>,
    ).every(([subFieldName, condition]) =>
      matchesOperator(fullName[subFieldName as keyof FullName], condition),
    );
  });

// Mirrors what the database does for the tool: filter, order by label then id, then apply the limit
const buildFakeFindRecordsService = (records: FakeRecord[]) =>
  jest.fn(async (params: FindRecordsParams) => {
    const sortByLabel = isDefined(params.orderBy) && params.orderBy.length > 0;

    const matchingRecords = records
      .filter((record) =>
        matchesFilter(record, params.filter as Record<string, unknown>),
      )
      .sort(
        (recordA, recordB) =>
          (sortByLabel
            ? getDisplayName(recordA).localeCompare(getDisplayName(recordB))
            : 0) || recordA.id.localeCompare(recordB.id),
      )
      .slice(0, params.limit);

    return {
      success: true,
      message: `Found ${matchingRecords.length} records`,
      result: {
        records: matchingRecords,
        count: matchingRecords.length,
        hasNextPage: false,
      },
      recordReferences: matchingRecords.map((record) => ({
        objectNameSingular: params.objectName,
        recordId: record.id,
        displayName: getDisplayName(record),
      })),
    };
  });

const buildNumberedRecords = (
  count: number,
  buildRecord: (paddedIndex: string) => FakeRecord,
) =>
  Array.from({ length: count }, (_, index) =>
    buildRecord(String(index).padStart(2, '0')),
  );

describe('NavigateAppTool', () => {
  let tool: NavigateAppTool;
  let findRecords: jest.Mock;
  let findViewsByWorkspaceId: jest.Mock;
  let workspaceCacheGetOrRecompute: jest.Mock;

  const setUp = async (
    records: FakeRecord[],
    rolesPermissions = buildRolesPermissions(),
  ) => {
    findRecords = buildFakeFindRecordsService(records);
    workspaceCacheGetOrRecompute = jest
      .fn()
      .mockResolvedValue({ rolesPermissions });
    findViewsByWorkspaceId = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NavigateAppTool,
        {
          provide: NavigationMenuItemService,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: ViewService,
          useValue: { findByWorkspaceId: findViewsByWorkspaceId },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: buildFlatEntityMaps([
                COMPANY_OBJECT,
                PERSON_OBJECT,
              ]),
              flatFieldMetadataMaps: buildFlatEntityMaps([
                COMPANY_NAME_FIELD,
                PERSON_NAME_FIELD,
              ]),
            }),
          },
        },
        {
          provide: FindRecordsService,
          useValue: { execute: findRecords },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { getOrRecompute: workspaceCacheGetOrRecompute },
        },
      ],
    }).compile();

    tool = module.get(NavigateAppTool);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const navigateToRecord = (
    objectNameSingular: string,
    recordName: string,
    context: ToolExecutionContext = TOOL_CONTEXT,
  ) =>
    tool.execute(
      {
        navigation: {
          type: 'navigateToRecord',
          objectNameSingular,
          recordName,
        },
      },
      context,
    );

  describe('navigateToRecord', () => {
    it('should run every lookup with the caller permissions, a minimal select and a row limit', async () => {
      await setUp([]);

      await navigateToRecord('company', 'Acme');

      expect(findRecords).toHaveBeenCalled();

      for (const [params] of findRecords.mock.calls) {
        expect(params).toMatchObject({
          objectName: 'company',
          select: ['name'],
          limit: CANDIDATE_LIMIT,
          authContext: CALLER_AUTH_CONTEXT,
          rolePermissionConfig: CALLER_ROLE_PERMISSION_CONFIG,
        });
      }
    });

    it('should find an exact match even when more than the row limit of other records also match', async () => {
      await setUp([
        ...buildNumberedRecords(CANDIDATE_LIMIT + 5, (paddedIndex) => ({
          id: `company-${paddedIndex}`,
          name: `Acme Holdings ${paddedIndex}`,
        })),
        { id: 'company-zz-exact', name: 'acme' },
      ]);

      const output = await navigateToRecord('company', 'Acme');

      expect(output.success).toBe(true);
      expect(output.result).toEqual({
        action: 'navigateToRecord',
        objectNameSingular: 'company',
        recordId: 'company-zz-exact',
      });
    });

    it('should prefer the shortest label starting with the name when there is no exact match', async () => {
      await setUp([
        ...buildNumberedRecords(CANDIDATE_LIMIT + 5, (paddedIndex) => ({
          id: `company-${paddedIndex}`,
          name: `The Acme Group ${paddedIndex}`,
        })),
        { id: 'company-zz-long', name: 'Acme Corporation International' },
        { id: 'company-zz-short', name: 'Acme Co' },
      ]);

      const output = await navigateToRecord('company', 'Acme');

      expect(output.result).toMatchObject({ recordId: 'company-zz-short' });
    });

    it('should match names containing every word when nothing starts with the name', async () => {
      await setUp([
        { id: 'company-1', name: 'Globex' },
        { id: 'company-2', name: 'The Acme 100% Group' },
      ]);

      const output = await navigateToRecord('company', '  acme   100%  ');

      expect(output.result).toMatchObject({ recordId: 'company-2' });
    });

    it('should find an exact full name even when more than the row limit of other people share a word', async () => {
      await setUp([
        ...buildNumberedRecords(CANDIDATE_LIMIT + 5, (paddedIndex) => ({
          id: `person-${paddedIndex}`,
          name: { firstName: 'John', lastName: `Doerty ${paddedIndex}` },
        })),
        {
          id: 'person-zz-exact',
          name: { firstName: 'John', lastName: 'Doe' },
        },
      ]);

      const output = await navigateToRecord('person', 'john doe');

      expect(output.result).toEqual({
        action: 'navigateToRecord',
        objectNameSingular: 'person',
        recordId: 'person-zz-exact',
      });
    });

    it('should return a generic not found result when the caller cannot read the object', async () => {
      await setUp([]);
      findRecords.mockResolvedValue({
        success: false,
        message: 'Failed to find company records',
        error: 'Permission denied',
      });

      const output = await navigateToRecord('company', 'Acme');

      expect(findRecords).toHaveBeenCalledTimes(1);
      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
      expect(output.error).toBe(
        'No company record matching "Acme" was found, or you do not have access to it.',
      );
    });

    it('should return the same not found result when no visible record matches', async () => {
      await setUp([{ id: 'company-1', name: 'Globex' }]);

      const output = await navigateToRecord('company', 'Acme');

      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
      expect(output.error).toBe(
        'No company record matching "Acme" was found, or you do not have access to it.',
      );
    });

    it('should not query records when the caller cannot read the label identifier field', async () => {
      await setUp(
        [{ id: 'company-1', name: 'Acme' }],
        buildRolesPermissions({
          [COMPANY_NAME_FIELD.id]: { canRead: false, canUpdate: false },
        }),
      );

      const output = await navigateToRecord('company', 'Acme');

      expect(findRecords).not.toHaveBeenCalled();
      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
      expect(output.error).toBe(
        'No company record matching "Acme" was found, or you do not have access to it.',
      );
    });

    it('should return the generic not found result when role permissions cannot be loaded', async () => {
      await setUp([{ id: 'company-1', name: 'Acme' }]);
      workspaceCacheGetOrRecompute.mockRejectedValue(
        new Error('Cache unavailable'),
      );

      const output = await navigateToRecord('company', 'Acme');

      expect(findRecords).not.toHaveBeenCalled();
      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
      expect(output.error).toBe(
        'No company record matching "Acme" was found, or you do not have access to it.',
      );
    });

    it.each([
      [
        'an auth context',
        { rolePermissionConfig: CALLER_ROLE_PERMISSION_CONFIG },
      ],
      ['role permissions', { authContext: CALLER_AUTH_CONTEXT }],
    ])(
      'should not query records without caller %s',
      async (_, callerContext) => {
        await setUp([{ id: 'company-1', name: 'Acme' }]);

        const output = await navigateToRecord('company', 'Acme', {
          workspaceId: WORKSPACE_ID,
          ...callerContext,
        });

        expect(findRecords).not.toHaveBeenCalled();
        expect(output.success).toBe(false);
        expect(output.result).toBeUndefined();
      },
    );

    it('should not query records for a blank record name', async () => {
      await setUp([{ id: 'company-1', name: 'Acme' }]);

      const output = await navigateToRecord('company', '   ');

      expect(findRecords).not.toHaveBeenCalled();
      expect(output.success).toBe(false);
    });
  });

  describe('navigateToView', () => {
    it('should only list views visible to the caller', async () => {
      await setUp([]);

      await tool.execute(
        { navigation: { type: 'navigateToView', viewName: 'All Companies' } },
        TOOL_CONTEXT,
      );

      expect(findViewsByWorkspaceId).toHaveBeenCalledWith(
        WORKSPACE_ID,
        USER_WORKSPACE_ID,
      );
    });
  });
});
