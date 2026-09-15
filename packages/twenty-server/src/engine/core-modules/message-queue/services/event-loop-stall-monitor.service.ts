import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const TICK_INTERVAL_MS = 500;
const STALL_THRESHOLD_MS = 5_000;
const LOG_MIN_INTERVAL_MS = 30_000;

type MonitoredJob = {
  queueName: string;
  jobName: string;
  workspaceId?: string;
  startedAt: number;
  endedAt?: number;
};

@Injectable()
export class EventLoopStallMonitorService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(EventLoopStallMonitorService.name);

  private readonly jobs = new Map<symbol, MonitoredJob>();
  private tickHandle?: NodeJS.Timeout;
  private lastTickAt = 0;
  private lastLogAt = 0;
  private suppressedStallCount = 0;

  onModuleInit() {
    this.lastTickAt = Date.now();
    this.tickHandle = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    this.tickHandle.unref();
  }

  onModuleDestroy() {
    if (isDefined(this.tickHandle)) {
      clearInterval(this.tickHandle);
    }
  }

  registerJobStart({
    queueName,
    jobName,
    workspaceId,
  }: {
    queueName: string;
    jobName: string;
    workspaceId?: string;
  }): symbol {
    const token = Symbol(jobName);

    this.jobs.set(token, {
      queueName,
      jobName,
      workspaceId,
      startedAt: Date.now(),
    });

    return token;
  }

  // Jobs are kept until the next tick instead of being removed: after a long
  // synchronous block, the job's finally runs in a microtask before the
  // overdue timer fires, so removing it here would hide the stalling job from
  // the very log line meant to name it.
  registerJobEnd(token: symbol) {
    const job = this.jobs.get(token);

    if (isDefined(job)) {
      job.endedAt = Date.now();
    }
  }

  private tick() {
    const now = Date.now();
    const previousTickAt = this.lastTickAt;
    const stallMs = now - previousTickAt - TICK_INTERVAL_MS;

    this.lastTickAt = now;

    if (stallMs >= STALL_THRESHOLD_MS) {
      if (now - this.lastLogAt >= LOG_MIN_INTERVAL_MS) {
        this.logStall({ stallMs, now, previousTickAt });
        this.lastLogAt = now;
        this.suppressedStallCount = 0;
      } else {
        this.suppressedStallCount += 1;
      }
    }

    for (const [token, job] of this.jobs) {
      if (isDefined(job.endedAt) && job.endedAt < previousTickAt) {
        this.jobs.delete(token);
      }
    }
  }

  private logStall({
    stallMs,
    now,
    previousTickAt,
  }: {
    stallMs: number;
    now: number;
    previousTickAt: number;
  }) {
    const inFlight = [...this.jobs.values()].filter(
      (job) => !isDefined(job.endedAt) || job.endedAt >= previousTickAt,
    );

    const jobs = inFlight
      .map(
        (job) =>
          `${job.queueName}/${job.jobName}` +
          (isNonEmptyString(job.workspaceId)
            ? ` workspace=${job.workspaceId}`
            : '') +
          ` elapsedMs=${(job.endedAt ?? now) - job.startedAt}` +
          (isDefined(job.endedAt) ? ' (just finished)' : ''),
      )
      .join('; ');

    const suppressedSuffix =
      this.suppressedStallCount > 0
        ? ` (${this.suppressedStallCount} earlier stall(s) not logged)`
        : '';

    this.logger.warn(
      `Event loop stalled for ${stallMs}ms with ${inFlight.length} job(s) in flight${suppressedSuffix}: ${isNonEmptyString(jobs) ? jobs : 'none'}`,
    );
  }
}
