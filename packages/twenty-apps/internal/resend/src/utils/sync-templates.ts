import { isDefined } from 'twenty-shared/utils';
import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchAllPaginated } from 'src/utils/fetch-all-paginated';
import type { SyncResult } from 'src/types/sync-result';
import type { CreateTemplateDto } from 'src/types/create-template.dto';
import type { UpdateTemplateDto } from 'src/types/update-template.dto';
import { getExistingRecordsMap } from 'src/utils/get-existing-records-map';
import { toEmailsField } from 'src/utils/to-emails-field';
import { toIsoString, toIsoStringOrNull } from 'src/utils/to-iso-string';
import { upsertRecords } from 'src/utils/upsert-records';

export const syncTemplates = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<{ result: SyncResult; templateHtmlMap: Map<string, string> }> => {
  const templates = await fetchAllPaginated((params) =>
    resend.templates.list(params),
  );
  const existingMap = await getExistingRecordsMap(client, 'resendTemplates');

  const htmlToResendIdMap = new Map<string, string>();

  const result = await upsertRecords({
    items: templates,
    getId: (template) => template.id,
    fetchDetail: async (id) => {
      const { data: detail, error } = await resend.templates.get(id);

      if (isDefined(error) || !isDefined(detail)) {
        throw new Error(
          `Failed to fetch template ${id}: ${JSON.stringify(error)}`,
        );
      }

      if (isDefined(detail.html)) {
        htmlToResendIdMap.set(detail.html, id);
      }

      return detail;
    },
    mapCreateData: (detail): CreateTemplateDto => ({
      name: detail.name,
      alias: detail.alias ?? '',
      status: (detail.status ?? 'UNKNOWN').toUpperCase(),
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
      status: (template.status ?? 'UNKNOWN').toUpperCase(),
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

  const templateHtmlMap = new Map<string, string>();

  for (const [html, resendId] of htmlToResendIdMap) {
    const twentyId = existingMap.get(resendId);

    if (isDefined(twentyId)) {
      templateHtmlMap.set(html, twentyId);
    }
  }

  return { result, templateHtmlMap };
};
