import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';
import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';
import { asObject } from 'src/logic-functions/utils/as-object';
import { buildFullName } from 'src/logic-functions/utils/build-full-name';
import { buildSlackBodyPreviewField } from 'src/logic-functions/utils/build-slack-body-preview-field';
import { buildSlackCompanyRefField } from 'src/logic-functions/utils/build-slack-company-ref-field';
import { buildSlackRecordRefField } from 'src/logic-functions/utils/build-slack-record-ref-field';
import { buildSlackStringField } from 'src/logic-functions/utils/build-slack-string-field';
import { buildSlackTimestampDetailFields } from 'src/logic-functions/utils/build-slack-timestamp-detail-fields';
import { buildSlackTimestampField } from 'src/logic-functions/utils/build-slack-timestamp-field';
import { formatAmount } from 'src/logic-functions/utils/format-amount';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';
import { getPublicAvatarUrl } from 'src/logic-functions/utils/get-public-avatar-url';
import { humanizeSelectValue } from 'src/logic-functions/utils/humanize-select-value';
import { toAbsoluteHttpUrl } from 'src/logic-functions/utils/to-absolute-http-url';

type SlackUnfurlContentArgs = {
  record: Record<string, unknown>;
  workspaceBaseUrl: string;
  includeDetails: boolean;
};

type SlackUnfurlContent = {
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
      buildSlackCompanyRefField({
        company: asObject(record.company),
        workspaceBaseUrl,
      }),
      buildSlackStringField({
        key: 'email',
        label: 'Email',
        value: asNonEmptyString(asObject(record.emails)?.primaryEmail),
        type: SLACK_ENTITY_FIELD_TYPE.EMAIL,
      }),
      buildSlackStringField({ key: 'phone', label: 'Phone', value: phone }),
      buildSlackStringField({
        key: 'jobTitle',
        label: 'Job title',
        value: asNonEmptyString(record.jobTitle),
      }),
      ...(includeDetails
        ? [
            buildSlackStringField({
              key: 'linkedin',
              label: 'LinkedIn',
              value: toAbsoluteHttpUrl(
                asNonEmptyString(asObject(record.linkedinLink)?.primaryLinkUrl),
              ),
              type: SLACK_ENTITY_FIELD_TYPE.LINK,
            }),
            ...buildSlackTimestampDetailFields(record),
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
      buildSlackStringField({
        key: 'domain',
        label: 'Domain',
        value: toAbsoluteHttpUrl(domainUrl),
        type: SLACK_ENTITY_FIELD_TYPE.LINK,
      }),
      buildSlackStringField({
        key: 'city',
        label: 'City',
        value: asNonEmptyString(address?.addressCity),
      }),
      ...(includeDetails
        ? [
            buildSlackStringField({
              key: 'country',
              label: 'Country',
              value: asNonEmptyString(address?.addressCountry),
            }),
            buildSlackStringField({
              key: 'annualRevenue',
              label: 'Annual revenue',
              value: formatAmount(asObject(record.annualRevenue)),
            }),
            buildSlackStringField({
              key: 'accountOwner',
              label: 'Account owner',
              value: buildFullName(asObject(record.accountOwner)?.name),
            }),
            buildSlackStringField({
              key: 'linkedin',
              label: 'LinkedIn',
              value: toAbsoluteHttpUrl(
                asNonEmptyString(asObject(record.linkedinLink)?.primaryLinkUrl),
              ),
              type: SLACK_ENTITY_FIELD_TYPE.LINK,
            }),
            ...buildSlackTimestampDetailFields(record),
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
      buildSlackCompanyRefField({ company, workspaceBaseUrl }),
      buildSlackStringField({
        key: 'stage',
        label: 'Stage',
        value: isDefined(stage) ? humanizeSelectValue(stage) : undefined,
      }),
      buildSlackStringField({
        key: 'amount',
        label: 'Amount',
        value: formatAmount(asObject(record.amount)),
      }),
      buildSlackTimestampField({
        key: 'closeDate',
        label: 'Close date',
        value: record.closeDate,
      }),
      ...(includeDetails
        ? [
            isDefined(pointOfContactId) && isDefined(pointOfContactName)
              ? buildSlackRecordRefField({
                  key: 'pointOfContact',
                  label: 'Point of contact',
                  objectNameSingular: 'person',
                  recordId: pointOfContactId,
                  title: pointOfContactName,
                  workspaceBaseUrl,
                })
              : undefined,
            ...buildSlackTimestampDetailFields(record),
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
        buildSlackBodyPreviewField(record.bodyV2),
        ...buildSlackTimestampDetailFields(record),
      ]
    : [
        buildSlackTimestampField({
          key: 'createdAt',
          label: 'Created',
          value: record.createdAt,
        }),
      ],
});

const buildTaskContent = ({
  record,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const status = asNonEmptyString(record.status);

  return {
    title: asNonEmptyString(record.title) ?? '',
    customFields: [
      buildSlackStringField({
        key: 'status',
        label: 'Status',
        value: isDefined(status) ? humanizeSelectValue(status) : undefined,
      }),
      buildSlackTimestampField({
        key: 'dueAt',
        label: 'Due date',
        value: record.dueAt,
      }),
      ...(includeDetails
        ? [
            buildSlackStringField({
              key: 'assignee',
              label: 'Assignee',
              value: buildFullName(asObject(record.assignee)?.name),
            }),
            buildSlackBodyPreviewField(record.bodyV2),
            ...buildSlackTimestampDetailFields(record),
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
