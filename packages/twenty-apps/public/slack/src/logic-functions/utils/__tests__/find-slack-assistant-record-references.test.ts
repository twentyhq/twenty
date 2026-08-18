import { describe, expect, it } from 'vitest';

import { findSlackAssistantRecordReferences } from 'src/logic-functions/utils/find-slack-assistant-record-references';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const ACME_ID = '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10';
const GLOBEX_ID = '9a11b2c3-44d5-4e6f-8a9b-0c1d2e3f4a5b';

describe('findSlackAssistantRecordReferences', () => {
  it('should read the object and record id out of a linked record', () => {
    expect(
      findSlackAssistantRecordReferences({
        responseText: `Moved [ACME](${WORKSPACE_BASE_URL}/object/company/${ACME_ID}) to Proposal.`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([
      {
        recordId: ACME_ID,
        objectNameSingular: 'company',
        recordUrl: `${WORKSPACE_BASE_URL}/object/company/${ACME_ID}`,
        name: 'ACME',
      },
    ]);
  });

  it('should count a record named twice as one reference', () => {
    const references = findSlackAssistantRecordReferences({
      responseText: `[ACME](${WORKSPACE_BASE_URL}/object/company/${ACME_ID}) and ${WORKSPACE_BASE_URL}/object/company/${ACME_ID} again.`,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(references).toHaveLength(1);
    expect(references[0].name).toBe('ACME');
  });

  it('should return every distinct record a list answer links', () => {
    expect(
      findSlackAssistantRecordReferences({
        responseText: `- [ACME](${WORKSPACE_BASE_URL}/object/company/${ACME_ID})\n- [Globex](${WORKSPACE_BASE_URL}/object/company/${GLOBEX_ID})`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }).map((reference) => reference.name),
    ).toEqual(['ACME', 'Globex']);
  });

  it('should ignore links pointing outside the workspace', () => {
    expect(
      findSlackAssistantRecordReferences({
        responseText: `[ACME](https://evil.example.com/object/company/${ACME_ID})`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([]);
  });

  it('should ignore ids that are not record ids', () => {
    expect(
      findSlackAssistantRecordReferences({
        responseText: `[ACME](${WORKSPACE_BASE_URL}/object/company/42)`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([]);
  });

  it('should return nothing when the workspace url is unknown', () => {
    expect(
      findSlackAssistantRecordReferences({
        responseText: `[ACME](${WORKSPACE_BASE_URL}/object/company/${ACME_ID})`,
        workspaceBaseUrl: undefined,
      }),
    ).toEqual([]);
  });
});
