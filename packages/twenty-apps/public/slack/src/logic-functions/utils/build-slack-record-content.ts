import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';
import {
  EMAIL_FIELD_TYPE,
  LINK_FIELD_TYPE,
  bodyPreviewField,
  buildCompanyRefField,
  buildFullName,
  buildRecordRefField,
  getPublicAvatarUrl,
  stringField,
  timestampDetailFields,
  timestampField,
} from 'src/logic-functions/utils/build-slack-entity-custom-fields';
import {
  asNonEmptyString,
  asObject,
} from 'src/logic-functions/utils/coerce-record-field-value';
import {
  formatAmount,
  humanizeSelectValue,
} from 'src/logic-functions/utils/format-record-field-value';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';

export type SlackUnfurlContentArgs = {
  record: Record<string, unknown>;
  workspaceBaseUrl: string;
  includeDetails: boolean;
};

export type SlackUnfurlContent = {
  title: string;
  customFields: (EntityCustomField | undefined)[];
  iconUrl?: string;
};

const buildPersonContent = ({
  record,
  workspaceBaseUrl,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const phones = asObject(record.phones);
  const phoneNumber = asNonEmptyString(phones?.primaryPhoneNumber);
  const phoneCallingCode = asNonEmptyString(phones?.primaryPhoneCallingCode);
  const phone = isDefined(phoneNumber)
    ? [phoneCallingCode, phoneNumber].filter(isDefined).join(' ')
    : undefined;

  return {
    title: buildFullName(record.name) ?? '',
    iconUrl: getPublicAvatarUrl({
      avatarUrl: record.avatarUrl,
      workspaceBaseUrl,
    }),
    customFields: [
      buildCompanyRefField({
        company: asObject(record.company),
        workspaceBaseUrl,
      }),
      stringField(
        'email',
        'Email',
        asNonEmptyString(asObject(record.emails)?.primaryEmail),
        EMAIL_FIELD_TYPE,
      ),
      stringField('phone', 'Phone', phone),
      stringField('jobTitle', 'Job title', asNonEmptyString(record.jobTitle)),
      ...(includeDetails
        ? [
            stringField(
              'linkedin',
              'LinkedIn',
              asNonEmptyString(asObject(record.linkedinLink)?.primaryLinkUrl),
              LINK_FIELD_TYPE,
            ),
            ...timestampDetailFields(record),
          ]
        : []),
    ],
  };
};

const buildCompanyContent = ({
  record,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const domainUrl = asNonEmptyString(
    asObject(record.domainName)?.primaryLinkUrl,
  );
  const address = asObject(record.address);

  return {
    title: asNonEmptyString(record.name) ?? '',
    iconUrl: getCompanyLogoUrl(domainUrl),
    customFields: [
      stringField('domain', 'Domain', domainUrl, LINK_FIELD_TYPE),
      stringField('city', 'City', asNonEmptyString(address?.addressCity)),
      ...(includeDetails
        ? [
            stringField(
              'country',
              'Country',
              asNonEmptyString(address?.addressCountry),
            ),
            stringField(
              'annualRevenue',
              'Annual revenue',
              formatAmount(asObject(record.annualRevenue)),
            ),
            stringField(
              'accountOwner',
              'Account owner',
              buildFullName(asObject(record.accountOwner)?.name),
            ),
            stringField(
              'linkedin',
              'LinkedIn',
              asNonEmptyString(asObject(record.linkedinLink)?.primaryLinkUrl),
              LINK_FIELD_TYPE,
            ),
            ...timestampDetailFields(record),
          ]
        : []),
    ],
  };
};

const buildOpportunityContent = ({
  record,
  workspaceBaseUrl,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const stage = asNonEmptyString(record.stage);
  const company = asObject(record.company);
  const pointOfContact = asObject(record.pointOfContact);
  const pointOfContactId = asNonEmptyString(pointOfContact?.id);
  const pointOfContactName = buildFullName(pointOfContact?.name);

  return {
    title: asNonEmptyString(record.name) ?? '',
    // An opportunity has no avatar of its own; its company's logo is the
    // recognizable mark.
    iconUrl: getCompanyLogoUrl(
      asNonEmptyString(asObject(company?.domainName)?.primaryLinkUrl),
    ),
    customFields: [
      buildCompanyRefField({ company, workspaceBaseUrl }),
      stringField(
        'stage',
        'Stage',
        isDefined(stage) ? humanizeSelectValue(stage) : undefined,
      ),
      stringField('amount', 'Amount', formatAmount(asObject(record.amount))),
      timestampField('closeDate', 'Close date', record.closeDate),
      ...(includeDetails
        ? [
            isDefined(pointOfContactId) && isDefined(pointOfContactName)
              ? buildRecordRefField({
                  key: 'pointOfContact',
                  label: 'Point of contact',
                  objectNameSingular: 'person',
                  recordId: pointOfContactId,
                  title: pointOfContactName,
                  workspaceBaseUrl,
                })
              : undefined,
            ...timestampDetailFields(record),
          ]
        : []),
    ],
  };
};

const buildNoteContent = ({
  record,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => ({
  title: asNonEmptyString(record.title) ?? '',
  customFields: includeDetails
    ? [
        bodyPreviewField(record.bodyV2),
        ...timestampDetailFields(record),
      ]
    : [timestampField('createdAt', 'Created', record.createdAt)],
});

const buildTaskContent = ({
  record,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const status = asNonEmptyString(record.status);

  return {
    title: asNonEmptyString(record.title) ?? '',
    customFields: [
      stringField(
        'status',
        'Status',
        isDefined(status) ? humanizeSelectValue(status) : undefined,
      ),
      timestampField('dueAt', 'Due date', record.dueAt),
      ...(includeDetails
        ? [
            stringField(
              'assignee',
              'Assignee',
              buildFullName(asObject(record.assignee)?.name),
            ),
            bodyPreviewField(record.bodyV2),
            ...timestampDetailFields(record),
          ]
        : []),
    ],
  };
};

export const SLACK_RECORD_CONTENT_BUILDERS: Record<
  SlackUnfurlObjectName,
  (args: SlackUnfurlContentArgs) => SlackUnfurlContent
> = {
  person: buildPersonContent,
  company: buildCompanyContent,
  opportunity: buildOpportunityContent,
  note: buildNoteContent,
  task: buildTaskContent,
};
