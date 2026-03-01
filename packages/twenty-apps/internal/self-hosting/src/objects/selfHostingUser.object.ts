import {
  defineObject,
  FieldType,
  RelationType,
  OnDeleteAction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

import { SELF_HOSTING_USER_ID_UNIVERSAL_IDENTIFIER } from 'src/fields/self-hosting-user-id';

export const SELF_HOSTING_USER_NAME_SINGULAR = 'selfHostingUser';

export default defineObject({
  universalIdentifier:
    UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.universalIdentifier,
  nameSingular: SELF_HOSTING_USER_NAME_SINGULAR,
  namePlural: 'selfHostingUsers',
  labelSingular: 'Self Hosting User',
  labelPlural: 'Self Hosting Users',
  fields: [
    {
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personId
          .universalIdentifier,
      name: 'person',
      label: 'Person',
      description: 'Person matching with the self hosting user',
      type: FieldType.RELATION,
      relationTargetFieldMetadataUniversalIdentifier:
        SELF_HOSTING_USER_ID_UNIVERSAL_IDENTIFIER,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'personId',
      },
    },
    {
      type: FieldType.FULL_NAME,
      name: 'name',
      label: 'Name',
      description: 'Name of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.name
          .universalIdentifier,
    },
    {
      type: FieldType.EMAILS,
      name: 'email',
      label: 'Email',
      description: 'The email of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.email
          .universalIdentifier,
    },
    {
      type: FieldType.LINKS,
      name: 'domain',
      label: 'Domain',
      description:
        'Domain extracted from the email address (e.g. domain.com / https://domain.com/)',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.domain
          .universalIdentifier,
    },
    {
      type: FieldType.UUID,
      name: 'userWorkspaceId',
      label: 'User workspace Id',
      description: 'User workspace id of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.userWorkspaceId
          .universalIdentifier,
    },
    {
      type: FieldType.UUID,
      name: 'userId',
      label: 'User Id',
      description: 'User id of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.userId
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'locale',
      label: 'Locale',
      description: 'Locale of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.locale
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'serverUrl',
      label: 'Server url',
      description: 'Server url of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.serverUrl
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'serverId',
      label: 'Server id',
      description: 'Server id of the self hosting user',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.serverId
          .universalIdentifier,
    },
    {
      type: FieldType.NUMBER,
      name: 'numberOfEmailsWithSameDomain',
      label: 'Number of Emails with Same Domain',
      description:
        'Aggregated count of self hosting users sharing the same business domain',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .numberOfEmailsWithSameDomain.universalIdentifier,
    },
    {
      type: FieldType.BOOLEAN,
      name: 'isEnriched',
      label: 'Is Enriched',
      description: 'Whether the record has been enriched',
      defaultValue: false,
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.isEnriched
          .universalIdentifier,
    },
    {
      type: FieldType.BOOLEAN,
      name: 'triedToBeEnriched',
      label: 'Tried to Be Enriched',
      description: 'Whether an enrichment attempt has been made',
      defaultValue: false,
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.triedToBeEnriched
          .universalIdentifier,
    },
    {
      type: FieldType.BOOLEAN,
      name: 'isPersonalEmail',
      label: 'Is Personal Email',
      description: 'Whether the email is a personal email address',
      defaultValue: true,
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.isPersonalEmail
          .universalIdentifier,
    },
    {
      type: FieldType.BOOLEAN,
      name: 'isTwenty',
      label: 'Is Twenty',
      description: 'Whether the user is from Twenty',
      defaultValue: false,
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.isTwenty
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'personCity',
      label: 'Person City',
      description: 'City of the person',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personCity
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'personCountry',
      label: 'Person Country',
      description: 'Country of the person',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personCountry
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'personJobFunction',
      label: 'Person Job Function',
      description: 'Job function of the person',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personJobFunction
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'personJobTitle',
      label: 'Person Job Title',
      description: 'Job title of the person',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personJobTitle
          .universalIdentifier,
    },
    {
      type: FieldType.LINKS,
      name: 'personLinkedIn',
      label: 'Person LinkedIn',
      description: 'LinkedIn profile of the person',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personLinkedIn
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'personSeniority',
      label: 'Person Seniority',
      description: 'Seniority level of the person',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.personSeniority
          .universalIdentifier,
    },
    {
      type: FieldType.NUMBER,
      name: 'companyAlexaRank',
      label: 'Company Alexa Rank',
      description: 'Alexa rank of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyAlexaRank
          .universalIdentifier,
    },
    {
      type: FieldType.CURRENCY,
      name: 'companyAnnualRevenue',
      label: 'Company Annual Revenue',
      description: 'Annual revenue of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyAnnualRevenue.universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyAnnualRevenuePrinted',
      label: 'Company Annual Revenue Printed',
      description: 'Formatted annual revenue of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyAnnualRevenuePrinted.universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyDescription',
      label: 'Company Description',
      description: 'Description of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyDescription
          .universalIdentifier,
    },
    {
      type: FieldType.NUMBER,
      name: 'companyEmployees',
      label: 'Company Employees',
      description: 'Number of employees at the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyEmployees
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyFoundedYear',
      label: 'Company Founded Year',
      description: 'Year the company was founded',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyFoundedYear
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyFundingLatestStage',
      label: 'Company Funding Latest Stage',
      description: 'Latest funding stage of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyFundingLatestStage.universalIdentifier,
    },
    {
      type: FieldType.NUMBER,
      name: 'companyFundingTotalAmount',
      label: 'Company Funding Total Amount',
      description: 'Total funding amount of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyFundingTotalAmount.universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyFundingTotalAmountPrinted',
      label: 'Company Funding Total Amount Printed',
      description: 'Formatted total funding amount of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields
          .companyFundingTotalAmountPrinted.universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyIndustries',
      label: 'Company Industries',
      description: 'Industries the company operates in',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyIndustries
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyIndustry',
      label: 'Company Industry',
      description: 'Primary industry of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyIndustry
          .universalIdentifier,
    },
    {
      type: FieldType.LINKS,
      name: 'companyLinkedIn',
      label: 'Company LinkedIn',
      description: 'LinkedIn page of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyLinkedIn
          .universalIdentifier,
    },
    {
      type: FieldType.TEXT,
      name: 'companyName',
      label: 'Company Name',
      description: 'Name of the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyName
          .universalIdentifier,
    },
    {
      type: FieldType.ARRAY,
      name: 'companyTags',
      label: 'Company Tags',
      description: 'Tags associated with the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyTags
          .universalIdentifier,
    },
    {
      type: FieldType.ARRAY,
      name: 'companyTech',
      label: 'Company Tech',
      description: 'Technologies used by the company',
      universalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.companyTech
          .universalIdentifier,
    },
  ],
});
