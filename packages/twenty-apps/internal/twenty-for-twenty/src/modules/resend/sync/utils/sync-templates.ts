import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { forEachPage } from '@modules/resend/shared/utils/for-each-page';
import { getErrorMessage } from '@modules/resend/shared/utils/get-error-message';
import { toEmailsField } from '@modules/resend/shared/utils/to-emails-field';
import {
  toIsoString,
  toIsoStringOrNull,
} from '@modules/resend/shared/utils/to-iso-string';
import { withRateLimitRetry } from '@modules/resend/shared/utils/with-rate-limit-retry';
import { withSyncCursor } from '@modules/resend/sync/cursor/utils/with-sync-cursor';
import type { CreateTemplateDto } from '@modules/resend/sync/types/create-template.dto';
import type { SyncResult } from '@modules/resend/sync/types/sync-result';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import type { UpdateTemplateDto } from '@modules/resend/sync/types/update-template.dto';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

type TemplateDetail = Awaited<
  ReturnType<Resend['templates']['get']>
>['data'];

const fetchTemplateDetailsForPage = async (
  resend: Resend,
  pageTemplates: ReadonlyArray<{ id: string }>,
  errors: string[],
): Promise<Map<string, NonNullable<TemplateDetail>>> => {
  const detailByResendId = new Map<string, NonNullable<TemplateDetail>>();

  for (const template of pageTemplates) {
    try {
      const { data: detail, error } = await withRateLimitRetry(
        () => resend.templates.get(template.id),
        { channel: 'templates-detail' },
      );

      if (isDefined(error) || !isDefined(detail)) {
        errors.push(
          `resendTemplate ${template.id} detail: ${JSON.stringify(error)}`,
        );
        continue;
      }

      detailByResendId.set(template.id, detail);
    } catch (error) {
      errors.push(
        `resendTemplate ${template.id} detail: ${getErrorMessage(error)}`,
      );
    }
  }

  return detailByResendId;
};

export type SyncTemplatesOptions = {
  deadlineAtMs?: number;
};

export const syncTemplates = async (
  resend: Resend,
  client: CoreApiClient,
  options?: SyncTemplatesOptions,
): Promise<SyncStepResult> => {
  const aggregate: SyncResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  await withSyncCursor(
    client,
    'TEMPLATES',
    async ({ resumeCursor, onCursorAdvance }) => {
      const { completed } = await forEachPage(
        (paginationParameters) => resend.templates.list(paginationParameters),
        async (pageTemplates) => {
          const detailByResendId = await fetchTemplateDetailsForPage(
            resend,
            pageTemplates,
            aggregate.errors,
          );

          const pageOutcome = await upsertRecords({
            items: pageTemplates,
            getId: (template) => template.id,
            mapCreateData: (_detail, template): CreateTemplateDto => {
              const detail = detailByResendId.get(template.id);

              return {
                name: template.name,
                alias: template.alias ?? '',
                status: template.status.toUpperCase(),
                createdAt: toIsoString(template.created_at),
                resendUpdatedAt: toIsoString(template.updated_at),
                publishedAt: toIsoStringOrNull(template.published_at),
                ...(isDefined(detail) && {
                  fromAddress: toEmailsField(detail.from),
                  subject: detail.subject ?? '',
                  replyTo: toEmailsField(detail.reply_to),
                  htmlBody: detail.html ?? '',
                  textBody: detail.text ?? '',
                }),
              };
            },
            mapUpdateData: (_detail, template): UpdateTemplateDto => {
              const detail = detailByResendId.get(template.id);

              return {
                name: template.name,
                alias: template.alias ?? '',
                status: template.status.toUpperCase(),
                resendUpdatedAt: toIsoString(template.updated_at),
                publishedAt: toIsoStringOrNull(template.published_at),
                ...(isDefined(detail) && {
                  fromAddress: toEmailsField(detail.from),
                  subject: detail.subject ?? '',
                  replyTo: toEmailsField(detail.reply_to),
                  htmlBody: detail.html ?? '',
                  textBody: detail.text ?? '',
                }),
              };
            },
            client,
            objectNameSingular: 'resendTemplate',
            objectNamePlural: 'resendTemplates',
          });

          aggregate.fetched += pageOutcome.result.fetched;
          aggregate.created += pageOutcome.result.created;
          aggregate.updated += pageOutcome.result.updated;
          aggregate.errors.push(...pageOutcome.result.errors);

          return { ok: pageOutcome.ok, errors: pageOutcome.result.errors };
        },
        'templates',
        {
          startCursor: resumeCursor,
          onCursorAdvance,
          ...(isDefined(options?.deadlineAtMs) && {
            deadlineAtMs: options.deadlineAtMs,
          }),
        },
      );

      return { value: undefined, completed };
    },
  );

  return { result: aggregate, value: undefined };
};
