import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';
import {
  asNonEmptyString,
  asObject,
  toEpochSeconds,
} from 'src/logic-functions/utils/coerce-record-field-value';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';

export const TIMESTAMP_FIELD_TYPE = 'slack#/types/timestamp';
export const LINK_FIELD_TYPE = 'slack#/types/link';
export const EMAIL_FIELD_TYPE = 'slack#/types/email';
export const ENTITY_REF_FIELD_TYPE = 'slack#/types/entity_ref';

export const stringField = (
  key: string,
  label: string,
  value: string | undefined,
  type: string = 'string',
): EntityCustomField | undefined =>
  isDefined(value) ? { key, label, type, value } : undefined;

export const timestampField = (
  key: string,
  label: string,
  value: unknown,
): EntityCustomField | undefined => {
  const epochSeconds = toEpochSeconds(value);

  return isDefined(epochSeconds)
    ? { key, label, type: TIMESTAMP_FIELD_TYPE, value: epochSeconds }
    : undefined;
};

export const timestampDetailFields = (
  record: Record<string, unknown>,
): (EntityCustomField | undefined)[] => [
  timestampField('createdAt', 'Created', record.createdAt),
  timestampField('updatedAt', 'Updated', record.updatedAt),
];

export const buildFullName = (nameValue: unknown): string | undefined => {
  const name = asObject(nameValue);
  const fullName = [
    asNonEmptyString(name?.firstName),
    asNonEmptyString(name?.lastName),
  ]
    .filter(isDefined)
    .join(' ');

  return fullName || undefined;
};

const BODY_PREVIEW_MAX_LENGTH = 300;

export const bodyPreviewField = (
  bodyValue: unknown,
): EntityCustomField | undefined => {
  const markdown = asNonEmptyString(asObject(bodyValue)?.markdown)?.trim();

  if (!isDefined(markdown) || markdown === '') {
    return undefined;
  }

  const preview =
    markdown.length > BODY_PREVIEW_MAX_LENGTH
      ? `${markdown.slice(0, BODY_PREVIEW_MAX_LENGTH)}…`
      : markdown;

  return {
    key: 'body',
    label: 'Body',
    type: 'string',
    value: preview,
    long: true,
  };
};

export const buildRecordRefField = ({
  key,
  label,
  objectNameSingular,
  recordId,
  title,
  iconUrl,
  workspaceBaseUrl,
}: {
  key: string;
  label: string;
  objectNameSingular: SlackUnfurlObjectName;
  recordId: string;
  title: string;
  iconUrl?: string;
  workspaceBaseUrl: string;
}): EntityCustomField => ({
  key,
  label,
  type: ENTITY_REF_FIELD_TYPE,
  entity_ref: {
    entity_url: `${workspaceBaseUrl}/object/${objectNameSingular}/${recordId}`,
    external_ref: { id: recordId, type: objectNameSingular },
    title,
    ...(isDefined(iconUrl) ? { icon: { alt_text: title, url: iconUrl } } : {}),
  },
});

export const buildCompanyRefField = ({
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

  return buildRecordRefField({
    key: 'company',
    label: 'Company',
    objectNameSingular: 'company',
    recordId: companyId,
    title: companyName,
    iconUrl: getCompanyLogoUrl(
      asNonEmptyString(asObject(company?.domainName)?.primaryLinkUrl),
    ),
    workspaceBaseUrl,
  });
};

// Only avatars that are already public absolute URLs render in Slack:
// instance-hosted files sit behind signed, often unreachable, URLs that
// Slack cannot fetch.
export const getPublicAvatarUrl = ({
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
