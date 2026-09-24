import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ENTITY_FIELD_TYPE } from 'src/logic-functions/constants/slack-entity-field-type';
import { SLACK_ENTITY_TYPE } from 'src/logic-functions/constants/slack-entity-type';
import { type SlackUnfurlContent } from 'src/logic-functions/types/slack-unfurl-content.type';
import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildFullName } from 'src/logic-functions/utils/build-full-name';
import { buildSlackBodyPreviewField } from 'src/logic-functions/utils/build-slack-body-preview-field';
import { buildSlackCompanyRefField } from 'src/logic-functions/utils/build-slack-company-ref-field';
import { buildSlackLinkedinField } from 'src/logic-functions/utils/build-slack-linkedin-field';
import { buildSlackRecordRefField } from 'src/logic-functions/utils/build-slack-record-ref-field';
import { buildSlackStringField } from 'src/logic-functions/utils/build-slack-string-field';
import { buildSlackTaskEntityFields } from 'src/logic-functions/utils/build-slack-task-entity-fields';
import { buildSlackTimestampDetailFields } from 'src/logic-functions/utils/build-slack-timestamp-detail-fields';
import { buildSlackTimestampField } from 'src/logic-functions/utils/build-slack-timestamp-field';
import { formatAmount } from 'src/logic-functions/utils/format-amount';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';
import { getPublicAvatarUrl } from 'src/logic-functions/utils/get-public-avatar-url';
import { humanizeSelectValue } from 'src/logic-functions/utils/humanize-select-value';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toAbsoluteHttpUrl } from 'src/logic-functions/utils/to-absolute-http-url';

type SlackUnfurlContentArgs = {
  record: Record<string, unknown>;
  workspaceBaseUrls: string[];
  includeDetails: boolean;
};

const buildPersonContent = ({
  record,
  workspaceBaseUrls,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const phones = asRecord(record.phones);
  const phoneNumber = readOptionalString(phones?.primaryPhoneNumber);
  const phoneCallingCode = readOptionalString(phones?.primaryPhoneCallingCode);
  const phone = isDefined(phoneNumber)
    ? [phoneCallingCode, phoneNumber].filter(isDefined).join(' ')
    : undefined;

  return {
    entityType: SLACK_ENTITY_TYPE.ITEM,
    title: buildFullName(record.name) ?? '',
    iconUrl: getPublicAvatarUrl({
      avatarUrl: record.avatarUrl,
      workspaceBaseUrls,
    }),
    customFields: [
      buildSlackCompanyRefField({
        company: asRecord(record.company),
        workspaceBaseUrl: workspaceBaseUrls[0],
      }),
      buildSlackStringField({
        key: 'jobTitle',
        label: 'Job title',
        value: readOptionalString(record.jobTitle),
      }),
      // the card is visible to everyone in the channel, Slack Connect guests
      // included, so contact details stay in the member-gated flexpane
      ...(includeDetails
        ? [
            buildSlackStringField({
              key: 'email',
              label: 'Email',
              value: readOptionalString(asRecord(record.emails)?.primaryEmail),
              type: SLACK_ENTITY_FIELD_TYPE.EMAIL,
            }),
            buildSlackStringField({
              key: 'phone',
              label: 'Phone',
              value: phone,
            }),
            buildSlackLinkedinField(record),
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
  const domainUrl = readOptionalString(
    asRecord(record.domainName)?.primaryLinkUrl,
  );
  const address = asRecord(record.address);

  return {
    entityType: SLACK_ENTITY_TYPE.ITEM,
    title: readOptionalString(record.name) ?? '',
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
        value: readOptionalString(address?.addressCity),
      }),
      ...(includeDetails
        ? [
            buildSlackStringField({
              key: 'country',
              label: 'Country',
              value: readOptionalString(address?.addressCountry),
            }),
            buildSlackStringField({
              key: 'annualRevenue',
              label: 'Annual revenue',
              value: formatAmount(asRecord(record.annualRevenue)),
            }),
            buildSlackStringField({
              key: 'accountOwner',
              label: 'Account owner',
              value: buildFullName(asRecord(record.accountOwner)?.name),
            }),
            buildSlackLinkedinField(record),
            ...buildSlackTimestampDetailFields(record),
          ]
        : []),
    ],
  };
};

const buildOpportunityContent = ({
  record,
  workspaceBaseUrls,
  includeDetails,
}: SlackUnfurlContentArgs): SlackUnfurlContent => {
  const stage = readOptionalString(record.stage);
  const company = asRecord(record.company);
  const pointOfContact = asRecord(record.pointOfContact);
  const pointOfContactId = readOptionalString(pointOfContact?.id);
  const pointOfContactName = buildFullName(pointOfContact?.name);

  return {
    entityType: SLACK_ENTITY_TYPE.ITEM,
    title: readOptionalString(record.name) ?? '',
    iconUrl: getCompanyLogoUrl(
      readOptionalString(asRecord(company?.domainName)?.primaryLinkUrl),
    ),
    customFields: [
      buildSlackCompanyRefField({
        company,
        workspaceBaseUrl: workspaceBaseUrls[0],
      }),
      buildSlackStringField({
        key: 'stage',
        label: 'Stage',
        value: isDefined(stage) ? humanizeSelectValue(stage) : undefined,
      }),
      buildSlackTimestampField({
        key: 'closeDate',
        label: 'Close date',
        value: record.closeDate,
      }),
      ...(includeDetails
        ? [
            // deal value is as sensitive as a person's contact details, and the
            // card reaches Slack Connect guests, so it stays in the flexpane
            buildSlackStringField({
              key: 'amount',
              label: 'Amount',
              value: formatAmount(asRecord(record.amount)),
            }),
            isDefined(pointOfContactId) && isDefined(pointOfContactName)
              ? buildSlackRecordRefField({
                  key: 'pointOfContact',
                  label: 'Point of contact',
                  objectNameSingular: 'person',
                  recordId: pointOfContactId,
                  title: pointOfContactName,
                  workspaceBaseUrl: workspaceBaseUrls[0],
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
  entityType: SLACK_ENTITY_TYPE.ITEM,
  title: readOptionalString(record.title) ?? '',
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
}: SlackUnfurlContentArgs): SlackUnfurlContent => ({
  entityType: SLACK_ENTITY_TYPE.TASK,
  title: readOptionalString(record.title) ?? '',
  fields: buildSlackTaskEntityFields({ record, includeDetails }),
});

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
