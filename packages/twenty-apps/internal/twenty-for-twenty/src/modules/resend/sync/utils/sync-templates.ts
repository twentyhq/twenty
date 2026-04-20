import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateTemplateDto } from 'src/modules/resend/sync/types/create-template.dto';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import type { UpdateTemplateDto } from 'src/modules/resend/sync/types/update-template.dto';
import { fetchAllPaginated } from 'src/modules/resend/shared/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/modules/resend/sync/utils/get-existing-records-map';
import { toEmailsField } from 'src/modules/resend/shared/utils/to-emails-field';
import {
  toIsoString,
  toIsoStringOrNull,
} from 'src/modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/sync/utils/upsert-records';
import { withRateLimitRetry } from 'src/modules/resend/shared/utils/with-rate-limit-retry';

export const syncTemplates = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<SyncStepResult> => {
  const templates = await fetchAllPaginated(
    (params) => resend.templates.list(params),
    'templates',
  );
  const existingMap = await getExistingRecordsMap(client, 'resendTemplates');

  const detailsMap = new Map<
    string,
    NonNullable<Awaited<ReturnType<typeof resend.templates.get>>['data']>
  >();

  for (const template of templates) {
    const { data: detail, error } = await withRateLimitRetry(() =>
      resend.templates.get(template.id),
    );

    if (isDefined(error) || !isDefined(detail)) {
      throw new Error(
        `Failed to fetch template ${template.id}: ${JSON.stringify(error)}`,
      );
    }

    detailsMap.set(template.id, detail);
  }

  const result = await upsertRecords({
    items: templates,
    getId: (template) => template.id,
    fetchDetail: async (id) => {
      const detail = detailsMap.get(id);

      if (!isDefined(detail)) {
        throw new Error(`Template detail for ${id} not found in cache`);
      }

      return detail;
    },
    mapCreateData: (detail): CreateTemplateDto => ({
      name: detail.name,
      alias: detail.alias ?? '',
      status: detail.status.toUpperCase(),
      fromAddress: toEmailsField(detail.from),
      subject: detail.subject ?? '',
      replyTo: toEmailsField(detail.reply_to),
      htmlBody: detail.html ?? '',
      textBody: detail.text ?? '',
      createdAt: toIsoString(detail.created_at),
      resendUpdatedAt: toIsoString(detail.updated_at),
      publishedAt: toIsoStringOrNull(detail.published_at),
    }),
    mapUpdateData: (detail, template): UpdateTemplateDto => ({
      name: template.name,
      alias: template.alias ?? '',
      status: template.status.toUpperCase(),
      fromAddress: toEmailsField(detail.from),
      subject: detail.subject ?? '',
      replyTo: toEmailsField(detail.reply_to),
      htmlBody: detail.html ?? '',
      textBody: detail.text ?? '',
      resendUpdatedAt: toIsoString(template.updated_at),
      publishedAt: toIsoStringOrNull(template.published_at),
    }),
    existingMap,
    client,
    objectNameSingular: 'resendTemplate',
  });

  return { result, value: undefined };
};
