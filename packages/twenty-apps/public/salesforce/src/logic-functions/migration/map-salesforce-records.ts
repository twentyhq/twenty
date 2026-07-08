import {
  type MappedRecord,
  type MappingContext,
  type MigrationObjectKey,
  type SalesforceRecord,
  type TargetRef,
} from 'src/logic-functions/migration/migration-types';

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export const normalizeWebsiteUrl = (value: unknown): string | null => {
  const raw = asString(value);

  if (raw === null) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);

    return url.origin;
  } catch {
    return null;
  }
};

export const mapOpportunityStage = ({
  stageName,
  isClosed,
  isWon,
}: {
  stageName: string | null;
  isClosed: boolean;
  isWon: boolean;
}): string => {
  if (isClosed) {
    // Twenty's default pipeline has no Closed Lost stage; the original stage
    // is preserved in the salesforceStage field either way.
    return isWon ? 'CUSTOMER' : 'NEW';
  }

  const normalizedStage = (stageName ?? '').toLowerCase();

  if (/propos|quot|negoti|review|contract/.test(normalizedStage)) {
    return 'PROPOSAL';
  }

  if (/decision|meeting|demo|percept/.test(normalizedStage)) {
    return 'MEETING';
  }

  if (/analysis|value|qualif|screen|discover/.test(normalizedStage)) {
    return 'SCREENING';
  }

  return 'NEW';
};

export const mapTaskStatus = (status: string | null): string => {
  const normalizedStatus = (status ?? '').toLowerCase();

  if (normalizedStatus === 'completed') {
    return 'DONE';
  }

  if (normalizedStatus === 'in progress') {
    return 'IN_PROGRESS';
  }

  return 'TODO';
};

const dateToDateTime = (value: unknown): string | null => {
  const date = asString(value);

  if (date === null) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00.000Z` : date;
};

const buildFullName = (record: SalesforceRecord) => ({
  firstName: asString(record.FirstName) ?? '',
  lastName: asString(record.LastName) ?? '',
});

const buildEmails = (record: SalesforceRecord) => {
  const email = asString(record.Email);

  return email === null
    ? undefined
    : { primaryEmail: email.toLowerCase(), additionalEmails: null };
};

const buildPhones = (record: SalesforceRecord) => {
  const phone = asString(record.Phone) ?? asString(record.MobilePhone);

  if (phone === null) {
    return undefined;
  }

  return {
    primaryPhoneNumber: phone,
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    additionalPhones: null,
  };
};

const SALESFORCE_ID_PREFIX_TO_TARGET_KIND: Record<
  string,
  TargetRef['targetKind']
> = {
  '001': 'company',
  '003': 'person',
  '00Q': 'person',
  '006': 'opportunity',
};

export const resolveTargetKindFromSalesforceId = (
  salesforceId: string | null,
): TargetRef['targetKind'] | null => {
  if (salesforceId === null) {
    return null;
  }

  return SALESFORCE_ID_PREFIX_TO_TARGET_KIND[salesforceId.slice(0, 3)] ?? null;
};

const buildTargetRefs = (
  candidateIds: (string | null)[],
): TargetRef[] | undefined => {
  const targetRefs: TargetRef[] = [];

  for (const candidateId of candidateIds) {
    const targetKind = resolveTargetKindFromSalesforceId(candidateId);

    if (targetKind !== null && candidateId !== null) {
      targetRefs.push({ targetKind, salesforceId: candidateId });
    }
  }

  return targetRefs.length > 0 ? targetRefs : undefined;
};

const mapAccount = (
  record: SalesforceRecord,
  context: MappingContext,
): MappedRecord => {
  const annualRevenue = asNumber(record.AnnualRevenue);
  const website = normalizeWebsiteUrl(record.Website);
  const data: Record<string, unknown> = {
    name: asString(record.Name) ?? record.Id,
    salesforceId: record.Id,
  };

  if (website !== null) {
    data.domainName = { primaryLinkUrl: website, primaryLinkLabel: '' };
  }

  const employees = asNumber(record.NumberOfEmployees);

  if (employees !== null) {
    data.employees = employees;
  }

  if (annualRevenue !== null) {
    data.annualRecurringRevenue = {
      amountMicros: Math.round(annualRevenue * 1_000_000),
      currencyCode: context.currencyIsoCode,
    };
  }

  const addressCity = asString(record.BillingCity);
  const addressStreet = asString(record.BillingStreet);

  if (addressCity !== null || addressStreet !== null) {
    data.address = {
      addressStreet1: addressStreet ?? '',
      addressStreet2: '',
      addressCity: addressCity ?? '',
      addressState: asString(record.BillingState) ?? '',
      addressPostcode: asString(record.BillingPostalCode) ?? '',
      addressCountry: asString(record.BillingCountry) ?? '',
    };
  }

  return { salesforceId: record.Id, data };
};

const mapContact = (record: SalesforceRecord): MappedRecord => {
  const data: Record<string, unknown> = {
    name: buildFullName(record),
    salesforceId: record.Id,
  };

  const emails = buildEmails(record);

  if (emails !== undefined) {
    data.emails = emails;
  }

  const phones = buildPhones(record);

  if (phones !== undefined) {
    data.phones = phones;
  }

  const jobTitle = asString(record.Title);

  if (jobTitle !== null) {
    data.jobTitle = jobTitle;
  }

  const city = asString(record.MailingCity) ?? asString(record.City);

  if (city !== null) {
    data.city = city;
  }

  const accountId = asString(record.AccountId);

  return {
    salesforceId: record.Id,
    data,
    ...(accountId !== null ? { companyRef: accountId } : {}),
  };
};

const mapLead = (record: SalesforceRecord): MappedRecord =>
  // Leads share the person mapping; they have City instead of MailingCity
  // and no AccountId, both handled by mapContact.
  mapContact(record);

const mapOpportunity = (
  record: SalesforceRecord,
  context: MappingContext,
): MappedRecord => {
  const amount = asNumber(record.Amount);
  const stageName = asString(record.StageName);
  const data: Record<string, unknown> = {
    name: asString(record.Name) ?? record.Id,
    salesforceId: record.Id,
    stage: mapOpportunityStage({
      stageName,
      isClosed: record.IsClosed === true,
      isWon: record.IsWon === true,
    }),
  };

  if (stageName !== null) {
    data.salesforceStage = stageName;
  }

  if (amount !== null) {
    data.amount = {
      amountMicros: Math.round(amount * 1_000_000),
      currencyCode: context.currencyIsoCode,
    };
  }

  const closeDate = asString(record.CloseDate);

  if (closeDate !== null) {
    data.closeDate = dateToDateTime(closeDate);
  }

  const accountId = asString(record.AccountId);

  return {
    salesforceId: record.Id,
    data,
    ...(accountId !== null ? { companyRef: accountId } : {}),
  };
};

const mapTask = (record: SalesforceRecord): MappedRecord => {
  const description = asString(record.Description);
  const data: Record<string, unknown> = {
    title: asString(record.Subject) ?? 'Untitled task',
    status: mapTaskStatus(asString(record.Status)),
    salesforceId: record.Id,
  };

  if (description !== null) {
    data.bodyV2 = { blocknote: null, markdown: description };
  }

  const dueAt = dateToDateTime(record.ActivityDate);

  if (dueAt !== null) {
    data.dueAt = dueAt;
  }

  return {
    salesforceId: record.Id,
    data,
    targetRefs: buildTargetRefs([
      asString(record.WhoId),
      asString(record.WhatId),
    ]),
  };
};

const mapNote = (record: SalesforceRecord): MappedRecord => {
  const body = asString(record.Body);
  const data: Record<string, unknown> = {
    title: asString(record.Title) ?? 'Untitled note',
    salesforceId: record.Id,
  };

  if (body !== null) {
    data.bodyV2 = { blocknote: null, markdown: body };
  }

  return {
    salesforceId: record.Id,
    data,
    targetRefs: buildTargetRefs([asString(record.ParentId)]),
  };
};

export const mapSalesforceRecord = (
  key: MigrationObjectKey,
  record: SalesforceRecord,
  context: MappingContext,
): MappedRecord => {
  switch (key) {
    case 'account':
      return mapAccount(record, context);
    case 'contact':
      return mapContact(record);
    case 'lead':
      return mapLead(record);
    case 'opportunity':
      return mapOpportunity(record, context);
    case 'task':
      return mapTask(record);
    case 'note':
      return mapNote(record);
  }
};
