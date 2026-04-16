import { isDefined } from 'twenty-shared/utils';
import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchAllPaginated } from 'src/utils/fetch-all-paginated';
import type { SyncResult } from 'src/types/sync-result';
import type { CreateTemplateDto } from 'src/types/create-template.dto';
import type { UpdateTemplateDto } from 'src/types/update-template.dto';
import { getExistingRecordsMap } from 'src/utils/get-existing-records-map';
import { upsertRecords } from 'src/utils/upsert-records';

export const syncTemplates = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<SyncResult> => {
  const templates = await fetchAllPaginated((params) =>
    resend.templates.list(params),
  );
  const existingMap = await getExistingRecordsMap(client, 'resendTemplates');

  return upsertRecords({
    items: templates,
    getId: (template) => template.id,
    fetchDetail: async (id) => {
      const { data: detail, error } = await resend.templates.get(id);

      if (isDefined(error) || !isDefined(detail)) {
        throw new Error(
          `Failed to fetch template ${id}: ${JSON.stringify(error)}`,
        );
      }

      return detail;
    },
    mapCreateData: (detail): CreateTemplateDto => ({
      name: detail.name,
      alias: detail.alias ?? '',
      status: detail.status.toUpperCase(),
      fromAddress: detail.from ?? '',
      subject: detail.subject ?? '',
      replyTo: detail.reply_to ?? '',
      htmlBody: detail.html ?? '',
      textBody: detail.text ?? '',
      createdAt: detail.created_at,
      resendUpdatedAt: detail.updated_at,
      publishedAt: detail.published_at,
    }),
    mapUpdateData: (template): UpdateTemplateDto => ({
      name: template.name,
      alias: template.alias ?? '',
      status: template.status.toUpperCase(),
      resendUpdatedAt: template.updated_at,
      publishedAt: template.published_at,
    }),
    existingMap,
    client,
    objectNameSingular: 'resendTemplate',
  });
};
