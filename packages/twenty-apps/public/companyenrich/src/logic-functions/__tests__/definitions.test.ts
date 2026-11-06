import { describe, expect, it, vi } from 'vitest';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import application from 'src/application.config';
import role from 'src/roles/application.role';
import specification from 'src/schemas/operations.json';
import { createResearchFunction } from '../utils/create-research-function';
import { createRecordFunction } from '../utils/create-record-function';
import {
  CompanyEnrichError,
  executeOperation,
} from '../utils/companyenrich-error';

describe('app contracts', () => {
  it('declares a workspace secret and restricts the role to company/person records', () => {
    expect(application.success).toBe(true);
    expect(
      application.config?.applicationVariables?.COMPANYENRICH_API_KEY,
    ).toMatchObject({ isSecret: true, isRequired: true });
    expect(role.success).toBe(true);
    expect(role.config).toMatchObject({
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canUpdateAllSettings: false,
      canBeAssignedToAgents: false,
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
      fieldPermissions: [],
    });
    expect(role.config?.objectPermissions).toEqual(
      ['company', 'person'].map((kind) => ({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[kind as 'company' | 'person']
            .universalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      })),
    );
  });

  it('exposes every operation to authenticated HTTP, workflow, and AI consumers', () => {
    const functions = [
      ...specification.operations.map((operation) =>
        createResearchFunction(operation.name),
      ),
      createRecordFunction('company'),
      createRecordFunction('person'),
    ];
    expect(
      new Set(functions.map((item) => item.universalIdentifier)).size,
    ).toBe(18);
    for (const definition of functions) {
      expect(definition.httpRouteTriggerSettings?.isAuthRequired).toBe(true);
      expect(
        definition.workflowActionTriggerSettings?.inputSchema,
      ).toBeDefined();
      expect(definition.toolTriggerSettings?.inputSchema).toBeDefined();
    }
  });

  it('returns actionable known errors while hiding unknown SDK error details', async () => {
    expect(
      await executeOperation(async () => {
        throw new CompanyEnrichError('Check the API key.');
      }),
    ).toEqual({ success: false, error: 'Check the API key.' });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await executeOperation(async () => {
      const error = new Error('private-token');
      error.stack =
        'Error: private-token\n    at operation (/srv/utils/enrich-record.ts:42:7)';
      throw error;
    });
    expect(log).toHaveBeenCalledWith(
      'CompanyEnrich unexpected operation failure',
      { locations: ['enrich-record.ts:42:7'] },
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-token');
    log.mockRestore();
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain('private-token');
  });

  it('exposes editable workflow JSON and supported expansion choices', () => {
    const schema =
      createResearchFunction('similar-companies').workflowActionTriggerSettings
        ?.inputSchema?.[0];
    expect(schema).toMatchObject({
      properties: {
        bodyJson: { type: 'string', multiline: true },
        expand: {
          type: 'array',
          items: { type: 'string', enum: ['workforce'] },
        },
      },
    });
    expect(JSON.stringify(schema)).not.toContain('"body":');
    const batch = createResearchFunction('enrich-companies-batch')
      .toolTriggerSettings?.inputSchema;
    expect(batch?.properties?.body?.properties?.domains?.description).toContain(
      'minItems: 1',
    );
    expect(batch?.properties?.body?.properties?.domains?.description).toContain(
      'maxItems: 50',
    );
  });

  it('describes nested search filters to AI tools without unresolved references', () => {
    const schema =
      createResearchFunction('search-people').toolTriggerSettings?.inputSchema;
    expect(schema?.properties?.body?.properties?.domains).toMatchObject({
      type: 'array',
      items: { type: 'string' },
    });
    expect(schema?.properties?.body?.properties?.positionQuery).toBeDefined();
    expect(JSON.stringify(schema)).not.toContain('"$ref"');
    expect(JSON.stringify(schema)).not.toContain('"anyOf"');
  });
});
