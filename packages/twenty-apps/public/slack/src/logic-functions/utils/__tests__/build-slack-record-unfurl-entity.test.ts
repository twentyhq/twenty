import { describe, expect, it } from 'vitest';

import { buildSlackRecordUnfurlEntity } from 'src/logic-functions/utils/build-slack-record-unfurl-entity';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const PERSON_ID = '20202020-0713-4b29-8f43-1111e2f6a4b1';
const COMPANY_ID = '20202020-0713-4b29-8f43-2222e2f6a4b2';

const buildPersonRecordLink = () => ({
  sharedUrl: `${WORKSPACE_BASE_URL}/object/person/${PERSON_ID}`,
  canonicalUrl: `${WORKSPACE_BASE_URL}/object/person/${PERSON_ID}`,
  objectNameSingular: 'person' as const,
  recordId: PERSON_ID,
});

const buildPersonRecord = () => ({
  id: PERSON_ID,
  name: { firstName: 'Ada', lastName: 'Lovelace' },
  jobTitle: 'CTO',
  emails: { primaryEmail: 'ada@acme.dev' },
  phones: { primaryPhoneNumber: '5551234', primaryPhoneCallingCode: '+1' },
  linkedinLink: { primaryLinkUrl: 'https://linkedin.com/in/ada' },
  company: {
    id: COMPANY_ID,
    name: 'ACME',
    domainName: { primaryLinkUrl: 'acme.dev' },
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
});

const OPPORTUNITY_ID = '20202020-0713-4b29-8f43-3333e2f6a4b3';

const buildOpportunityRecordLink = () => ({
  sharedUrl: `${WORKSPACE_BASE_URL}/object/opportunity/${OPPORTUNITY_ID}`,
  canonicalUrl: `${WORKSPACE_BASE_URL}/object/opportunity/${OPPORTUNITY_ID}`,
  objectNameSingular: 'opportunity' as const,
  recordId: OPPORTUNITY_ID,
});

const buildOpportunityRecord = () => ({
  id: OPPORTUNITY_ID,
  name: 'ACME renewal',
  stage: 'NEW_CUSTOMER',
  amount: { amountMicros: 1_500_000_000, currencyCode: 'USD' },
  closeDate: '2026-03-01T00:00:00.000Z',
  company: {
    id: COMPANY_ID,
    name: 'ACME',
    domainName: { primaryLinkUrl: 'acme.dev' },
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
});

const TASK_ID = '20202020-0713-4b29-8f43-4444e2f6a4b4';

const buildTaskRecordLink = () => ({
  sharedUrl: `${WORKSPACE_BASE_URL}/object/task/${TASK_ID}`,
  canonicalUrl: `${WORKSPACE_BASE_URL}/object/task/${TASK_ID}`,
  objectNameSingular: 'task' as const,
  recordId: TASK_ID,
});

const buildTaskRecord = () => ({
  id: TASK_ID,
  title: 'Follow up with ACME',
  status: 'IN_PROGRESS',
  dueAt: '2026-03-01T00:00:00.000Z',
  assignee: { name: { firstName: 'Ada', lastName: 'Lovelace' } },
  bodyV2: { markdown: 'Ping them about the renewal' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
});

describe('buildSlackRecordUnfurlEntity', () => {
  it('should build an item entity for a person card', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildPersonRecordLink(),
      record: buildPersonRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity).toMatchObject({
      entity_type: 'slack#/entities/item',
      external_ref: { id: PERSON_ID, type: 'person' },
      url: `${WORKSPACE_BASE_URL}/object/person/${PERSON_ID}`,
      app_unfurl_url: `${WORKSPACE_BASE_URL}/object/person/${PERSON_ID}`,
      entity_payload: {
        attributes: {
          title: { text: 'Ada Lovelace' },
          display_type: 'Person',
          product_name: 'Twenty',
          metadata_last_modified: Math.floor(
            Date.parse('2026-02-01T00:00:00.000Z') / 1000,
          ),
        },
      },
    });
  });

  it('should keep the in-channel card to headline fields', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildPersonRecordLink(),
      record: buildPersonRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(
      entity?.entity_payload.custom_fields?.map((field) => field.key),
    ).toEqual(['company', 'jobTitle']);
  });

  it('should keep contact details off the channel-visible card', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildPersonRecordLink(),
      record: buildPersonRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(
      entity?.entity_payload.custom_fields?.map((field) => field.key),
    ).not.toContain('email');
    expect(
      entity?.entity_payload.custom_fields?.map((field) => field.key),
    ).not.toContain('phone');
  });

  it('should add the detail fields for the flexpane', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildPersonRecordLink(),
      record: buildPersonRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
      includeDetails: true,
    });

    expect(
      entity?.entity_payload.custom_fields?.map((field) => field.key),
    ).toEqual([
      'company',
      'jobTitle',
      'email',
      'phone',
      'linkedin',
      'createdAt',
      'updatedAt',
    ]);
  });

  it('should link the company as an entity ref with its logo', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildPersonRecordLink(),
      record: buildPersonRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity?.entity_payload.custom_fields?.[0]).toEqual({
      key: 'company',
      label: 'Company',
      type: 'slack#/types/entity_ref',
      entity_ref: {
        entity_url: `${WORKSPACE_BASE_URL}/object/company/${COMPANY_ID}`,
        external_ref: { id: COMPANY_ID, type: 'company' },
        title: 'ACME',
        icon: { alt_text: 'ACME', url: 'https://twenty-icons.com/acme.dev' },
      },
    });
  });

  it('should absolutize a bare company domain so Slack accepts the link field', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: {
        sharedUrl: `${WORKSPACE_BASE_URL}/object/company/${COMPANY_ID}`,
        canonicalUrl: `${WORKSPACE_BASE_URL}/object/company/${COMPANY_ID}`,
        objectNameSingular: 'company',
        recordId: COMPANY_ID,
      },
      record: { name: 'ACME', domainName: { primaryLinkUrl: 'acme.dev' } },
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity?.entity_payload.custom_fields).toContainEqual({
      key: 'domain',
      label: 'Domain',
      type: 'slack#/types/link',
      value: 'https://acme.dev/',
    });
  });

  it('should fall back to the Twenty mark when the record has no icon', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: {
        sharedUrl: `${WORKSPACE_BASE_URL}/object/note/${PERSON_ID}`,
        canonicalUrl: `${WORKSPACE_BASE_URL}/object/note/${PERSON_ID}`,
        objectNameSingular: 'note',
        recordId: PERSON_ID,
      },
      record: { title: 'Kickoff notes' },
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(
      entity?.entity_payload.attributes.product_icon,
    ).toMatchObject({ alt_text: 'Twenty' });
  });

  it('should return undefined when the record has no title', () => {
    expect(
      buildSlackRecordUnfurlEntity({
        recordLink: buildPersonRecordLink(),
        record: { name: {} },
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
      }),
    ).toBeUndefined();
  });

  it('should keep the deal amount off the channel-visible card', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildOpportunityRecordLink(),
      record: buildOpportunityRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(
      entity?.entity_payload.custom_fields?.map((field) => field.key),
    ).toEqual(['company', 'stage', 'closeDate']);
  });

  it('should add the deal amount to the flexpane', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildOpportunityRecordLink(),
      record: buildOpportunityRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
      includeDetails: true,
    });

    expect(
      entity?.entity_payload.custom_fields?.map((field) => field.key),
    ).toContain('amount');
  });

  it('should build a typed task entity rather than a generic item', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildTaskRecordLink(),
      record: buildTaskRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity?.entity_type).toBe('slack#/entities/task');
    expect(entity?.entity_payload.custom_fields).toBeUndefined();
  });

  it('should keep the task card to status and due date', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildTaskRecordLink(),
      record: buildTaskRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity?.entity_payload.fields).toEqual({
      status: { label: 'Status', value: 'In progress' },
      due_date: {
        label: 'Due date',
        type: 'slack#/types/timestamp',
        value: Math.floor(Date.parse('2026-03-01T00:00:00.000Z') / 1000),
      },
    });
  });

  it('should add the assignee and body to the task flexpane', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildTaskRecordLink(),
      record: buildTaskRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
      includeDetails: true,
    });

    expect(entity?.entity_payload.fields).toMatchObject({
      assignee: {
        label: 'Assignee',
        type: 'slack#/types/user',
        user: { text: 'Ada Lovelace' },
      },
      description: {
        label: 'Body',
        value: 'Ping them about the renewal',
        long: true,
      },
      date_created: { label: 'Created' },
      date_updated: { label: 'Updated' },
    });
  });

  it('should omit the fields payload for a task with nothing to show', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildTaskRecordLink(),
      record: { id: TASK_ID, title: 'Follow up with ACME' },
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity?.entity_payload.fields).toBeUndefined();
  });

  it('should still build a generic item entity for a person', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildPersonRecordLink(),
      record: buildPersonRecord(),
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
    });

    expect(entity?.entity_type).toBe('slack#/entities/item');
    expect(entity?.entity_payload.fields).toBeUndefined();
  });

  it('should not clip a task body at the card preview length', () => {
    const entity = buildSlackRecordUnfurlEntity({
      recordLink: buildTaskRecordLink(),
      record: { ...buildTaskRecord(), bodyV2: { markdown: 'a'.repeat(1000) } },
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
      includeDetails: true,
    });

    expect(entity?.entity_payload.fields).toMatchObject({
      description: { value: 'a'.repeat(1000) },
    });
  });
});
