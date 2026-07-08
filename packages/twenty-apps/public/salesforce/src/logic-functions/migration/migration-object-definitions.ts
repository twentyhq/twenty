import {
  type MigrationObjectDefinition,
  type MigrationObjectKey,
} from 'src/logic-functions/migration/migration-types';

export const MIGRATION_OBJECT_DEFINITIONS: MigrationObjectDefinition[] = [
  {
    key: 'account',
    salesforceObject: 'Account',
    targetObjectSingular: 'company',
    targetObjectPlural: 'companies',
    itemLabel: 'Accounts → Companies',
    processingOrder: 0,
    soqlFields: [
      'Id',
      'Name',
      'Website',
      'NumberOfEmployees',
      'AnnualRevenue',
      'BillingStreet',
      'BillingCity',
      'BillingState',
      'BillingPostalCode',
      'BillingCountry',
    ],
    fieldMapping: {
      Name: 'name',
      Website: 'domainName',
      NumberOfEmployees: 'employees',
      AnnualRevenue: 'annualRecurringRevenue',
      'BillingStreet/City/State/PostalCode/Country': 'address',
    },
    relationNotes: [],
  },
  {
    key: 'contact',
    salesforceObject: 'Contact',
    targetObjectSingular: 'person',
    targetObjectPlural: 'people',
    itemLabel: 'Contacts → People',
    processingOrder: 1,
    soqlFields: [
      'Id',
      'FirstName',
      'LastName',
      'Email',
      'Phone',
      'MobilePhone',
      'Title',
      'MailingCity',
      'AccountId',
    ],
    fieldMapping: {
      'FirstName + LastName': 'name',
      Email: 'emails',
      'Phone / MobilePhone': 'phones',
      Title: 'jobTitle',
      MailingCity: 'city',
    },
    relationNotes: ['AccountId → company'],
  },
  {
    key: 'lead',
    salesforceObject: 'Lead',
    targetObjectSingular: 'person',
    targetObjectPlural: 'people',
    itemLabel: 'Leads → People',
    processingOrder: 2,
    soqlFields: [
      'Id',
      'FirstName',
      'LastName',
      'Email',
      'Phone',
      'Title',
      'City',
    ],
    soqlWhere: 'IsConverted = false',
    fieldMapping: {
      'FirstName + LastName': 'name',
      Email: 'emails',
      Phone: 'phones',
      Title: 'jobTitle',
      City: 'city',
    },
    relationNotes: [
      'Only unconverted leads are migrated (converted leads already exist as contacts)',
    ],
  },
  {
    key: 'opportunity',
    salesforceObject: 'Opportunity',
    targetObjectSingular: 'opportunity',
    targetObjectPlural: 'opportunities',
    itemLabel: 'Opportunities → Opportunities',
    processingOrder: 3,
    soqlFields: [
      'Id',
      'Name',
      'Amount',
      'CloseDate',
      'StageName',
      'IsClosed',
      'IsWon',
      'AccountId',
    ],
    fieldMapping: {
      Name: 'name',
      Amount: 'amount',
      CloseDate: 'closeDate',
      StageName: 'stage + salesforceStage',
    },
    relationNotes: ['AccountId → company'],
  },
  {
    key: 'task',
    salesforceObject: 'Task',
    targetObjectSingular: 'task',
    targetObjectPlural: 'tasks',
    itemLabel: 'Tasks → Tasks',
    processingOrder: 4,
    soqlFields: [
      'Id',
      'Subject',
      'Description',
      'Status',
      'ActivityDate',
      'WhoId',
      'WhatId',
    ],
    fieldMapping: {
      Subject: 'title',
      Description: 'body',
      Status: 'status',
      ActivityDate: 'dueAt',
    },
    relationNotes: [
      'WhoId (Contact/Lead) → task target on person',
      'WhatId (Account/Opportunity) → task target on company/opportunity',
    ],
  },
  {
    key: 'note',
    salesforceObject: 'Note',
    targetObjectSingular: 'note',
    targetObjectPlural: 'notes',
    itemLabel: 'Notes → Notes',
    processingOrder: 5,
    soqlFields: ['Id', 'Title', 'Body', 'ParentId'],
    fieldMapping: {
      Title: 'title',
      Body: 'body',
    },
    relationNotes: [
      'ParentId (Account/Contact/Opportunity) → note target',
      'Classic Notes only; ContentNotes (enhanced notes) are not migrated yet',
    ],
  },
];

export const getMigrationObjectDefinition = (
  key: string,
): MigrationObjectDefinition | undefined =>
  MIGRATION_OBJECT_DEFINITIONS.find((definition) => definition.key === key);

export const getMigrationObjectDefinitionBySalesforceObject = (
  salesforceObject: string,
): MigrationObjectDefinition | undefined =>
  MIGRATION_OBJECT_DEFINITIONS.find(
    (definition) => definition.salesforceObject === salesforceObject,
  );

export const isMigrationObjectKey = (
  value: string,
): value is MigrationObjectKey =>
  MIGRATION_OBJECT_DEFINITIONS.some((definition) => definition.key === value);

export const buildBatchSoql = ({
  definition,
  lastProcessedId,
  batchSize,
}: {
  definition: MigrationObjectDefinition;
  lastProcessedId: string | null;
  batchSize: number;
}): string => {
  const whereClauses: string[] = [];

  if (definition.soqlWhere !== undefined) {
    whereClauses.push(definition.soqlWhere);
  }

  if (lastProcessedId !== null && lastProcessedId.length > 0) {
    whereClauses.push(`Id > '${lastProcessedId}'`);
  }

  const whereClause =
    whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

  return `SELECT ${definition.soqlFields.join(', ')} FROM ${definition.salesforceObject}${whereClause} ORDER BY Id ASC LIMIT ${batchSize}`;
};

export const buildCountSoql = (
  definition: MigrationObjectDefinition,
): string => {
  const whereClause =
    definition.soqlWhere !== undefined ? ` WHERE ${definition.soqlWhere}` : '';

  return `SELECT COUNT() FROM ${definition.salesforceObject}${whereClause}`;
};
