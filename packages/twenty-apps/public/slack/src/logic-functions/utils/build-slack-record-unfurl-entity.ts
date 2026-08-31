import {
  type EntityCustomField,
  type EntityMetadata,
} from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';

const ITEM_ENTITY_TYPE = 'slack#/entities/item';
const TIMESTAMP_FIELD_TYPE = 'slack#/types/timestamp';
const LINK_FIELD_TYPE = 'slack#/types/link';
const EMAIL_FIELD_TYPE = 'slack#/types/email';
const ENTITY_REF_FIELD_TYPE = 'slack#/types/entity_ref';

// Slack fetches the icon itself, so it must be a public URL: the workspace's
// own instance may not be reachable from Slack (self-hosted, local dev).
const TWENTY_PRODUCT_ICON_URL =
  'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-front/public/images/icons/ios/192.png';

const DISPLAY_TYPE_BY_OBJECT: Record<SlackUnfurlObjectName, string> = {
  person: 'Person',
  company: 'Company',
  opportunity: 'Opportunity',
  note: 'Note',
  task: 'Task',
};

const asObject = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const asNonEmptyString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

const asFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const toEpochSeconds = (value: unknown): number | undefined => {
  const text = asNonEmptyString(value);

  if (!isDefined(text)) {
    return undefined;
  }

  const milliseconds = Date.parse(text);

  return Number.isNaN(milliseconds)
    ? undefined
    : Math.floor(milliseconds / 1000);
};

// SELECT values arrive as API enum-like strings such as IN_PROGRESS.
const humanizeSelectValue = (value: string): string => {
  const words = value.replace(/_/g, ' ').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const formatAmount = (
  amount: Record<string, unknown> | undefined,
): string | undefined => {
  const amountMicros = asFiniteNumber(amount?.amountMicros);

  if (!isDefined(amountMicros)) {
    return undefined;
  }

  const value = amountMicros / 1_000_000;
  const currencyCode = asNonEmptyString(amount?.currencyCode);

  if (isDefined(currencyCode)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      // Falls through for currency codes Intl does not know.
    }
  }

  return new Intl.NumberFormat('en-US').format(value);
};

const stringField = (
  key: string,
  label: string,
  value: string | undefined,
  type: string = 'string',
): EntityCustomField | undefined =>
  isDefined(value) ? { key, label, type, value } : undefined;

const timestampField = (
  key: string,
  label: string,
  value: unknown,
): EntityCustomField | undefined => {
  const epochSeconds = toEpochSeconds(value);

  return isDefined(epochSeconds)
    ? { key, label, type: TIMESTAMP_FIELD_TYPE, value: epochSeconds }
    : undefined;
};

type SlackUnfurlContentArgs = {
  record: Record<string, unknown>;
  workspaceBaseUrl: string;
};

const buildCompanyRefField = ({
  company,
  workspaceBaseUrl,
}: {
  company: Record<string, unknown> | undefined;
  workspaceBaseUrl: string;
}): EntityCustomField | undefined => {
  const companyId = asNonEmptyString(company?.id);
  const companyName = asNonEmptyString(company?.name);

  if (!isDefined(companyId) || !isDefined(companyName)) {
    return undefined;
  }

  const companyLogoUrl = getCompanyLogoUrl(
    asNonEmptyString(asObject(company?.domainName)?.primaryLinkUrl),
  );

  return {
    key: 'company',
    label: 'Company',
    type: ENTITY_REF_FIELD_TYPE,
    entity_ref: {
      entity_url: `${workspaceBaseUrl}/object/company/${companyId}`,
      external_ref: { id: companyId },
      title: companyName,
      ...(isDefined(companyLogoUrl)
        ? { icon: { alt_text: companyName, url: companyLogoUrl } }
        : {}),
    },
  };
};

// Only avatars that are already public absolute URLs render in Slack:
// instance-hosted files sit behind signed, often unreachable, URLs that
// Slack cannot fetch.
const getPublicAvatarUrl = ({
  avatarUrl,
  workspaceBaseUrl,
}: {
  avatarUrl: unknown;
  workspaceBaseUrl: string;
}): string | undefined => {
  const url = asNonEmptyString(avatarUrl);

  if (!isDefined(url) || !/^https?:\/\//.test(url)) {
    return undefined;
  }

  return url.startsWith(workspaceBaseUrl) ? undefined : url;
};

const buildPersonContent = ({
  record,
  workspaceBaseUrl,
}: SlackUnfurlContentArgs) => {
  const name = asObject(record.name);
  const title = [
    asNonEmptyString(name?.firstName),
    asNonEmptyString(name?.lastName),
  ]
    .filter(isDefined)
    .join(' ');

  const phones = asObject(record.phones);
  const phoneNumber = asNonEmptyString(phones?.primaryPhoneNumber);
  const phoneCallingCode = asNonEmptyString(phones?.primaryPhoneCallingCode);
  const phone = isDefined(phoneNumber)
    ? [phoneCallingCode, phoneNumber].filter(isDefined).join(' ')
    : undefined;

  const companyField = buildCompanyRefField({
    company: asObject(record.company),
    workspaceBaseUrl,
  });

  return {
    title,
    iconUrl: getPublicAvatarUrl({
      avatarUrl: record.avatarUrl,
      workspaceBaseUrl,
    }),
    customFields: [
      companyField,
      stringField(
        'email',
        'Email',
        asNonEmptyString(asObject(record.emails)?.primaryEmail),
        EMAIL_FIELD_TYPE,
      ),
      stringField('phone', 'Phone', phone),
      stringField('jobTitle', 'Job title', asNonEmptyString(record.jobTitle)),
      stringField('city', 'City', asNonEmptyString(record.city)),
    ],
  };
};

const buildCompanyContent = ({ record }: SlackUnfurlContentArgs) => {
  const domainUrl = asNonEmptyString(
    asObject(record.domainName)?.primaryLinkUrl,
  );
  const employees = asFiniteNumber(record.employees);

  return {
    title: asNonEmptyString(record.name) ?? '',
    iconUrl: getCompanyLogoUrl(domainUrl),
    customFields: [
      stringField('domain', 'Domain', domainUrl, LINK_FIELD_TYPE),
      stringField(
        'employees',
        'Employees',
        isDefined(employees)
          ? new Intl.NumberFormat('en-US').format(employees)
          : undefined,
      ),
      stringField(
        'city',
        'City',
        asNonEmptyString(asObject(record.address)?.addressCity),
      ),
    ],
  };
};

const buildOpportunityContent = ({
  record,
  workspaceBaseUrl,
}: SlackUnfurlContentArgs) => {
  const stage = asNonEmptyString(record.stage);
  const company = asObject(record.company);

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
    ],
  };
};

const buildNoteContent = ({ record }: SlackUnfurlContentArgs) => ({
  title: asNonEmptyString(record.title) ?? '',
  customFields: [timestampField('createdAt', 'Created', record.createdAt)],
});

const buildTaskContent = ({ record }: SlackUnfurlContentArgs) => {
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
    ],
  };
};

const CONTENT_BUILDERS: Record<
  SlackUnfurlObjectName,
  (args: SlackUnfurlContentArgs) => {
    title: string;
    customFields: (EntityCustomField | undefined)[];
    iconUrl?: string;
  }
> = {
  person: buildPersonContent,
  company: buildCompanyContent,
  opportunity: buildOpportunityContent,
  note: buildNoteContent,
  task: buildTaskContent,
};

export const buildSlackRecordUnfurlEntity = ({
  recordLink,
  record,
  workspaceBaseUrl,
}: {
  recordLink: SlackRecordLink;
  record: Record<string, unknown>;
  workspaceBaseUrl: string;
}): EntityMetadata | undefined => {
  const { title, customFields, iconUrl } = CONTENT_BUILDERS[
    recordLink.objectNameSingular
  ]({ record, workspaceBaseUrl });

  if (!isNonEmptyString(title)) {
    return undefined;
  }

  const definedCustomFields = customFields.filter(isDefined);
  const metadataLastModified = toEpochSeconds(record.updatedAt);

  return {
    entity_type: ITEM_ENTITY_TYPE,
    entity_payload: {
      attributes: {
        title: { text: title },
        display_type: DISPLAY_TYPE_BY_OBJECT[recordLink.objectNameSingular],
        product_name: 'Twenty',
        // The record's own logo when it has one (company favicon), so the
        // card is recognizable at a glance; the Twenty mark otherwise.
        product_icon: isDefined(iconUrl)
          ? { alt_text: title, url: iconUrl }
          : { alt_text: 'Twenty', url: TWENTY_PRODUCT_ICON_URL },
        ...(isDefined(metadataLastModified)
          ? { metadata_last_modified: metadataLastModified }
          : {}),
      },
      ...(definedCustomFields.length > 0
        ? { custom_fields: definedCustomFields }
        : {}),
    },
    // The type makes the flexpane request self-describing: Slack echoes the
    // external_ref back in entity_details_requested.
    external_ref: {
      id: recordLink.recordId,
      type: recordLink.objectNameSingular,
    },
    url: recordLink.url,
    app_unfurl_url: recordLink.url,
  };
};
