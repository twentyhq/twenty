import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import {
  type CommonInput,
  type FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { TRACKED_JOB_PAGE_SIZE } from 'src/engine/core-modules/tracked-job/constants/tracked-job-page-size.constant';
import { TRACKED_JOB_REQUESTER_REFRESH_INTERVAL_MS } from 'src/engine/core-modules/tracked-job/constants/tracked-job-requester-refresh-interval-ms.constant';
import { TrackedJobException } from 'src/engine/core-modules/tracked-job/exceptions/tracked-job.exception';
import { TrackedJobWorkspaceService } from 'src/engine/core-modules/tracked-job/services/tracked-job.workspace-service';
import { type TrackedJobPageQuery } from 'src/engine/core-modules/tracked-job/types/tracked-job-page-query.type';
import { type TrackedJobPage } from 'src/engine/core-modules/tracked-job/types/tracked-job-page.type';
import { type TrackedJobProgress } from 'src/engine/core-modules/tracked-job/types/tracked-job-progress.type';
import { type TrackedJobRun } from 'src/engine/core-modules/tracked-job/types/tracked-job-run.type';
import { type TrackedJob } from 'src/engine/core-modules/tracked-job/types/tracked-job.type';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class TrackedJobRunnerWorkspaceService {
  constructor(
    private readonly trackedJobWorkspaceService: TrackedJobWorkspaceService,
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly i18nService: I18nService,
  ) {}

  async run<TProgress extends TrackedJobProgress = TrackedJobProgress>(
    {
      trackedJob,
      context: { updateProgress, abortSignal },
      failedMessage,
    }: {
      trackedJob: TrackedJob;
      context: MessageQueueJobProgressContext;
      failedMessage: MessageDescriptor;
    },
    execute: (run: TrackedJobRun<TProgress>) => Promise<void>,
  ): Promise<void> {
    let lastProgress: TProgress | undefined;
    let locale: keyof typeof APP_LOCALES = SOURCE_LOCALE;

    try {
      await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
        trackedJob,
      );
      const signal = this.createAbortSignal(trackedJob, abortSignal);

      await this.trackedJobWorkspaceService.assertConnected(trackedJob, signal);
      const requester =
        await this.trackedJobWorkspaceService.resolveRequester(trackedJob);

      locale = requester.workspaceMember.locale;
      await execute({
        requester,
        signal,
        reportProgress: async (progress) => {
          lastProgress = progress;
          await updateProgress(progress);
        },
        readPages: (query) =>
          this.readPages({ trackedJob, requester, signal, ...query }),
      });
      await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
        trackedJob,
      );
      await this.trackedJobWorkspaceService.assertConnected(trackedJob, signal);
    } catch (error) {
      await updateProgress({
        ...lastProgress,
        errorMessage: this.i18nService
          .getI18nInstance(locale)
          ._(
            error instanceof CustomException
              ? error.userFriendlyMessage
              : failedMessage,
          ),
      }).catch(() => {});
      throw error;
    }
  }

  private async *readPages({
    trackedJob,
    requester,
    signal,
    queryRunnerContext,
    selectedFields,
    filter,
    orderBy,
  }: TrackedJobPageQuery & {
    trackedJob: TrackedJob;
    requester: UserWorkspaceAuthContext;
    signal: AbortSignal;
  }): AsyncGenerator<TrackedJobPage> {
    const context: CommonBaseQueryRunnerContext = {
      ...queryRunnerContext,
      authContext: requester,
    };
    const { totalCount } = await this.findRecords(context, {
      filter,
      selectedFields: { ...selectedFields, totalCount: true },
      first: 0,
    });

    if (!isDefined(totalCount)) {
      throw new TrackedJobException(
        'Record count is unavailable',
        'RECORD_COUNT_UNAVAILABLE',
      );
    }

    let after: string | undefined;
    let processedCount = 0;
    let lastRequesterRefreshAt = Date.now();

    while (true) {
      await this.trackedJobWorkspaceService.assertConnected(trackedJob, signal);
      await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
        trackedJob,
      );
      if (
        Date.now() - lastRequesterRefreshAt >=
        TRACKED_JOB_REQUESTER_REFRESH_INTERVAL_MS
      ) {
        context.authContext =
          await this.trackedJobWorkspaceService.resolveRequester(trackedJob);
        lastRequesterRefreshAt = Date.now();
      } else {
        await this.trackedJobWorkspaceService.assertRequester(
          context.authContext,
          trackedJob.permissionFlag,
        );
      }
      const { records, pageInfo } = await this.findRecords(context, {
        filter,
        orderBy,
        selectedFields,
        first: TRACKED_JOB_PAGE_SIZE,
        after,
      });

      await this.trackedJobWorkspaceService.assertPermissionsUnchanged(
        trackedJob,
      );
      await this.trackedJobWorkspaceService.assertConnected(trackedJob, signal);
      processedCount += records.length;
      yield { records, processedCount, totalCount: Number(totalCount) };
      if (!pageInfo.hasNextPage) {
        return;
      }
      if (!isDefined(pageInfo.endCursor) || pageInfo.endCursor === after) {
        throw new TrackedJobException(
          'Pagination did not advance',
          'PAGINATION_FAILED',
        );
      }
      after = pageInfo.endCursor;
    }
  }

  private async findRecords(
    context: CommonBaseQueryRunnerContext,
    args: CommonInput<FindManyQueryArgs>,
  ) {
    const { results } = await withWorkspaceAuthContext(
      context.authContext,
      () => this.commonFindManyQueryRunnerService.execute(args, context),
    );

    return results;
  }

  private createAbortSignal(
    trackedJob: TrackedJob,
    abortSignal?: AbortSignal,
  ): AbortSignal {
    const remainingTime = trackedJob.expiresAt - Date.now();

    if (remainingTime <= 0) {
      throw new TrackedJobException(
        'Duration limit exceeded',
        'DURATION_LIMIT_EXCEEDED',
        {
          userFriendlyMessage: msg`This took too long. Please try again with fewer records.`,
        },
      );
    }

    return AbortSignal.any([
      AbortSignal.timeout(remainingTime),
      ...(isDefined(abortSignal) ? [abortSignal] : []),
    ]);
  }
}
