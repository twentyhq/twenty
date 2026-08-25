import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

const TICK_INTERVAL_MS = 500;
const STALL_THRESHOLD_MS = 5_000;

type RunningJob = {
  queueName: string;
  jobName: string;
  workspaceId?: string;
  startedAt: number;
};

// A stalled event loop cannot be observed from within the stalled code, but a
// timer that fires late reveals both the stall duration and which jobs were in
// flight while it happened.
@Injectable()
export class EventLoopStallMonitorService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(EventLoopStallMonitorService.name);

  private readonly runningJobs = new Map<symbol, RunningJob>();
  private tickHandle?: NodeJS.Timeout;
  private lastTickAt = 0;

  onModuleInit() {
    this.lastTickAt = Date.now();
    this.tickHandle = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    this.tickHandle.unref();
  }

  onModuleDestroy() {
    if (this.tickHandle) {
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

    this.runningJobs.set(token, {
      queueName,
      jobName,
      workspaceId,
      startedAt: Date.now(),
    });

    return token;
  }

  registerJobEnd(token: symbol) {
    this.runningJobs.delete(token);
  }

  private tick() {
    const now = Date.now();
    const stallMs = now - this.lastTickAt - TICK_INTERVAL_MS;

    this.lastTickAt = now;

    if (stallMs < STALL_THRESHOLD_MS) {
      return;
    }

    const jobs = [...this.runningJobs.values()]
      .map(
        (runningJob) =>
          `${runningJob.queueName}/${runningJob.jobName}` +
          (runningJob.workspaceId
            ? ` workspace=${runningJob.workspaceId}`
            : '') +
          ` elapsedMs=${now - runningJob.startedAt}`,
      )
      .join('; ');

    this.logger.warn(
      `Event loop stalled for ${stallMs}ms with ${this.runningJobs.size} job(s) in flight: ${jobs || 'none'}`,
    );
  }
}
