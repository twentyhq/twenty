import { describe, expect, it } from 'vitest';

import {
  mapOpportunityStage,
  mapSalesforceRecord,
  mapTaskStatus,
  normalizeWebsiteUrl,
  resolveTargetKindFromSalesforceId,
} from 'src/logic-functions/migration/map-salesforce-records';

const context = { currencyIsoCode: 'EUR' };

describe('normalizeWebsiteUrl', () => {
  it('should keep valid urls and reduce them to their origin', () => {
    expect(normalizeWebsiteUrl('https://acme.com/about')).toBe('https://acme.com');
  });

  it('should add a protocol when missing', () => {
    expect(normalizeWebsiteUrl('acme.com')).toBe('https://acme.com');
  });

  it('should return null for empty or invalid values', () => {
    expect(normalizeWebsiteUrl(null)).toBeNull();
    expect(normalizeWebsiteUrl('   ')).toBeNull();
    expect(normalizeWebsiteUrl('not a url')).toBeNull();
  });
});

describe('mapOpportunityStage', () => {
  it('should map closed won to CUSTOMER', () => {
    expect(
      mapOpportunityStage({ stageName: 'Closed Won', isClosed: true, isWon: true }),
    ).toBe('CUSTOMER');
  });

  it('should map closed lost to NEW while the raw stage is preserved separately', () => {
    expect(
      mapOpportunityStage({ stageName: 'Closed Lost', isClosed: true, isWon: false }),
    ).toBe('NEW');
  });

  it('should map open stages heuristically', () => {
    expect(
      mapOpportunityStage({
        stageName: 'Proposal/Price Quote',
        isClosed: false,
        isWon: false,
      }),
    ).toBe('PROPOSAL');
    expect(
      mapOpportunityStage({
        stageName: 'Negotiation/Review',
        isClosed: false,
        isWon: false,
      }),
    ).toBe('PROPOSAL');
    expect(
      mapOpportunityStage({
        stageName: 'Id. Decision Makers',
        isClosed: false,
        isWon: false,
      }),
    ).toBe('MEETING');
    expect(
      mapOpportunityStage({
        stageName: 'Needs Analysis',
        isClosed: false,
        isWon: false,
      }),
    ).toBe('SCREENING');
    expect(
      mapOpportunityStage({
        stageName: 'Prospecting',
        isClosed: false,
        isWon: false,
      }),
    ).toBe('NEW');
  });
});

describe('mapTaskStatus', () => {
  it('should map Salesforce task statuses to Twenty statuses', () => {
    expect(mapTaskStatus('Completed')).toBe('DONE');
    expect(mapTaskStatus('In Progress')).toBe('IN_PROGRESS');
    expect(mapTaskStatus('Not Started')).toBe('TODO');
    expect(mapTaskStatus(null)).toBe('TODO');
  });
});

describe('resolveTargetKindFromSalesforceId', () => {
  it('should resolve target kinds from Salesforce Id prefixes', () => {
    expect(resolveTargetKindFromSalesforceId('001xx000003DGb2AAG')).toBe('company');
    expect(resolveTargetKindFromSalesforceId('003xx000004TmiQAAS')).toBe('person');
    expect(resolveTargetKindFromSalesforceId('00Qxx000001a2bcEAA')).toBe('person');
    expect(resolveTargetKindFromSalesforceId('006xx000001a2bcEAA')).toBe(
      'opportunity',
    );
    expect(resolveTargetKindFromSalesforceId('500xx0000000001AAA')).toBeNull();
    expect(resolveTargetKindFromSalesforceId(null)).toBeNull();
  });
});

describe('mapSalesforceRecord', () => {
  it('should map an account to a company', () => {
    const mapped = mapSalesforceRecord(
      'account',
      {
        Id: '001xx000003DGb2AAG',
        Name: 'Acme',
        Website: 'www.acme.com',
        NumberOfEmployees: 250,
        AnnualRevenue: 1_500_000,
        BillingStreet: '1 Main St',
        BillingCity: 'Paris',
        BillingCountry: 'France',
      },
      context,
    );

    expect(mapped.salesforceId).toBe('001xx000003DGb2AAG');
    expect(mapped.data.name).toBe('Acme');
    expect(mapped.data.domainName).toEqual({
      primaryLinkUrl: 'https://www.acme.com',
      primaryLinkLabel: '',
    });
    expect(mapped.data.employees).toBe(250);
    expect(mapped.data.annualRecurringRevenue).toEqual({
      amountMicros: 1_500_000_000_000,
      currencyCode: 'EUR',
    });
    expect(mapped.data.address).toMatchObject({
      addressStreet1: '1 Main St',
      addressCity: 'Paris',
      addressCountry: 'France',
    });
    expect(mapped.data.salesforceId).toBe('001xx000003DGb2AAG');
  });

  it('should map a contact to a person with a company reference', () => {
    const mapped = mapSalesforceRecord(
      'contact',
      {
        Id: '003xx000004TmiQAAS',
        FirstName: 'Jane',
        LastName: 'Doe',
        Email: 'Jane.Doe@Acme.com',
        Phone: '+33 1 23 45 67 89',
        Title: 'CTO',
        MailingCity: 'Lyon',
        AccountId: '001xx000003DGb2AAG',
      },
      context,
    );

    expect(mapped.data.name).toEqual({ firstName: 'Jane', lastName: 'Doe' });
    expect(mapped.data.emails).toEqual({
      primaryEmail: 'jane.doe@acme.com',
      additionalEmails: null,
    });
    expect(mapped.data.jobTitle).toBe('CTO');
    expect(mapped.data.city).toBe('Lyon');
    expect(mapped.companyRef).toBe('001xx000003DGb2AAG');
  });

  it('should map a lead to a person without a company reference', () => {
    const mapped = mapSalesforceRecord(
      'lead',
      {
        Id: '00Qxx000001a2bcEAA',
        FirstName: 'John',
        LastName: 'Smith',
        Email: 'john@prospect.io',
        City: 'Berlin',
      },
      context,
    );

    expect(mapped.data.name).toEqual({ firstName: 'John', lastName: 'Smith' });
    expect(mapped.data.city).toBe('Berlin');
    expect(mapped.companyRef).toBeUndefined();
  });

  it('should map an opportunity with amount, stage, and close date', () => {
    const mapped = mapSalesforceRecord(
      'opportunity',
      {
        Id: '006xx000001a2bcEAA',
        Name: 'Big deal',
        Amount: 99_000.5,
        CloseDate: '2026-09-30',
        StageName: 'Closed Lost',
        IsClosed: true,
        IsWon: false,
        AccountId: '001xx000003DGb2AAG',
      },
      context,
    );

    expect(mapped.data.stage).toBe('NEW');
    expect(mapped.data.salesforceStage).toBe('Closed Lost');
    expect(mapped.data.amount).toEqual({
      amountMicros: 99_000_500_000,
      currencyCode: 'EUR',
    });
    expect(mapped.data.closeDate).toBe('2026-09-30T00:00:00.000Z');
    expect(mapped.companyRef).toBe('001xx000003DGb2AAG');
  });

  it('should map a task with body, due date, and target references', () => {
    const mapped = mapSalesforceRecord(
      'task',
      {
        Id: '00Txx000001a2bcEAA',
        Subject: 'Call back',
        Description: 'Discuss renewal',
        Status: 'Completed',
        ActivityDate: '2026-01-15',
        WhoId: '003xx000004TmiQAAS',
        WhatId: '006xx000001a2bcEAA',
      },
      context,
    );

    expect(mapped.data.title).toBe('Call back');
    expect(mapped.data.status).toBe('DONE');
    expect(mapped.data.bodyV2).toEqual({
      blocknote: null,
      markdown: 'Discuss renewal',
    });
    expect(mapped.data.dueAt).toBe('2026-01-15T00:00:00.000Z');
    expect(mapped.targetRefs).toEqual([
      { targetKind: 'person', salesforceId: '003xx000004TmiQAAS' },
      { targetKind: 'opportunity', salesforceId: '006xx000001a2bcEAA' },
    ]);
  });

  it('should map a note with its parent as target reference', () => {
    const mapped = mapSalesforceRecord(
      'note',
      {
        Id: '002xx000001a2bcEAA',
        Title: 'Meeting notes',
        Body: 'Key points…',
        ParentId: '001xx000003DGb2AAG',
      },
      context,
    );

    expect(mapped.data.title).toBe('Meeting notes');
    expect(mapped.targetRefs).toEqual([
      { targetKind: 'company', salesforceId: '001xx000003DGb2AAG' },
    ]);
  });

  it('should fall back to defaults for empty values', () => {
    const mapped = mapSalesforceRecord(
      'task',
      { Id: '00Txx000001a2bcEAA', Subject: null, Status: null },
      context,
    );

    expect(mapped.data.title).toBe('Untitled task');
    expect(mapped.data.status).toBe('TODO');
    expect(mapped.data.bodyV2).toBeUndefined();
    expect(mapped.targetRefs).toBeUndefined();
  });
});
