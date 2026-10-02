import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { NavigateAppTool } from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

const WORKSPACE_ID = 'workspace-1';
const USER_WORKSPACE_ID = 'user-workspace-1';

const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: USER_WORKSPACE_ID,
} as unknown as WorkspaceAuthContext;

const ROLE_PERMISSION_CONFIG = {
  intersectionOf: ['member-role', 'agent-role'],
};

const TOOL_CONTEXT: ToolExecutionContext = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
  authContext: AUTH_CONTEXT,
  rolePermissionConfig: ROLE_PERMISSION_CONFIG,
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

describe('NavigateAppTool', () => {
  let tool: NavigateAppTool;
  let findRecords: jest.Mock;
  let findViewsByWorkspaceId: jest.Mock;

  beforeEach(async () => {
    findRecords = jest.fn().mockResolvedValue({
      success: true,
      message: 'Found 0 company records',
      result: { records: [], count: 0, hasNextPage: false },
      recordReferences: [],
    });
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
      ],
    }).compile();

    tool = module.get(NavigateAppTool);
  });

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
    it('should look records up with the caller auth context and role permissions', async () => {
      await navigateToRecord('company', 'Acme');

      expect(findRecords).toHaveBeenCalledTimes(1);
      expect(findRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          objectName: 'company',
          authContext: AUTH_CONTEXT,
          rolePermissionConfig: ROLE_PERMISSION_CONFIG,
        }),
      );
    });

    it('should bound the lookup with a name filter, a minimal select and a limit', async () => {
      await navigateToRecord('company', '  Acme   100%  ');

      expect(findRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            and: [
              { name: { ilike: '%Acme%' } },
              { name: { ilike: '%100\\%%' } },
            ],
          },
          select: ['name'],
          limit: 20,
        }),
      );
    });

    it('should match each word against first and last name for full name label identifiers', async () => {
      await navigateToRecord('person', 'John Doe');

      expect(findRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          objectName: 'person',
          filter: {
            and: [
              {
                or: [
                  { name: { firstName: { ilike: '%John%' } } },
                  { name: { lastName: { ilike: '%John%' } } },
                ],
              },
              {
                or: [
                  { name: { firstName: { ilike: '%Doe%' } } },
                  { name: { lastName: { ilike: '%Doe%' } } },
                ],
              },
            ],
          },
        }),
      );
    });

    it('should return the best match among the records visible to the caller', async () => {
      findRecords.mockResolvedValue({
        success: true,
        message: 'Found 2 company records',
        result: { records: [], count: 2, hasNextPage: false },
        recordReferences: [
          {
            objectNameSingular: 'company',
            recordId: 'acme-holdings-id',
            displayName: 'Acme Holdings International',
          },
          {
            objectNameSingular: 'company',
            recordId: 'acme-id',
            displayName: 'Acme',
          },
        ],
      });

      const output = await navigateToRecord('company', 'Acme');

      expect(output.success).toBe(true);
      expect(output.result).toEqual({
        action: 'navigateToRecord',
        objectNameSingular: 'company',
        recordId: 'acme-id',
      });
    });

    it('should return a generic not found result when the caller cannot read the object', async () => {
      findRecords.mockResolvedValue({
        success: false,
        message: 'Failed to find company records',
        error: 'Permission denied',
      });

      const output = await navigateToRecord('company', 'Acme');

      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
      expect(output.error).toBe(
        'No company record matching "Acme" was found, or you do not have access to it.',
      );
    });

    it('should return the same not found result when no visible record matches', async () => {
      const output = await navigateToRecord('company', 'Acme');

      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
      expect(output.error).toBe(
        'No company record matching "Acme" was found, or you do not have access to it.',
      );
    });

    it('should not query records without a caller auth context', async () => {
      const output = await navigateToRecord('company', 'Acme', {
        workspaceId: WORKSPACE_ID,
      });

      expect(findRecords).not.toHaveBeenCalled();
      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
    });

    it('should not query records for a blank record name', async () => {
      const output = await navigateToRecord('company', '   ');

      expect(findRecords).not.toHaveBeenCalled();
      expect(output.success).toBe(false);
    });
  });

  describe('navigateToView', () => {
    it('should only list views visible to the caller', async () => {
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
