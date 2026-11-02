import { describe, expect, it } from 'vitest';

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
    expect(role.config?.canReadAllObjectRecords).toBe(false);
    expect(role.config?.canDestroyAllObjectRecords).toBe(false);
    expect(role.config?.objectPermissions).toHaveLength(2);
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
    const result = await executeOperation(async () => {
      throw new Error('private-token');
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain('private-token');
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
