import { Test } from '@nestjs/testing';
import * as Sentry from '@sentry/node';

import { EnterpriseKeyValidationCronCommand } from 'src/engine/core-modules/enterprise/cron/command/organization-key-validation.cron.command';
import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/organization-key-validation.cron.job';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { getOrganizationKeyValidationCronPattern } from 'src/engine/core-modules/enterprise/utils/get-organization-key-validation-cron-pattern.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

jest.mock('@sentry/node', () => ({
  withMonitor: jest.fn(<TResult>(_slug: string, callback: () => TResult) =>
    callback(),
  ),
}));

jest.mock(
  'src/engine/core-modules/enterprise/services/enterprise-plan.service',
  () => ({ EnterprisePlanService: class EnterprisePlanService {} }),
);

jest.mock(
  'src/engine/core-modules/message-queue/services/message-queue.service',
  () => ({ MessageQueueService: class MessageQueueService {} }),
);

describe('organization key validation schedule', () => {
  const enterprisePlanService = {
    getOrCreateServerId: jest.fn(),
    refreshValidityToken: jest.fn(),
    getBillableSeatCount: jest.fn(),
    reportSeats: jest.fn(),
  };
  const messageQueueService = { addCron: jest.fn() };
  let command: EnterpriseKeyValidationCronCommand;
  let job: EnterpriseKeyValidationCronJob;

  beforeEach(async () => {
    jest.clearAllMocks();
    enterprisePlanService.getOrCreateServerId.mockResolvedValue(
      'server-example',
    );
    enterprisePlanService.refreshValidityToken.mockResolvedValue(true);
    enterprisePlanService.getBillableSeatCount.mockResolvedValue(2);
    enterprisePlanService.reportSeats.mockResolvedValue(true);

    const module = await Test.createTestingModule({
      providers: [
        EnterpriseKeyValidationCronCommand,
        EnterpriseKeyValidationCronJob,
        { provide: EnterprisePlanService, useValue: enterprisePlanService },
        {
          provide: getQueueToken(MessageQueue.cronQueue),
          useValue: messageQueueService,
        },
      ],
    }).compile();

    command = module.get(EnterpriseKeyValidationCronCommand);
    job = module.get(EnterpriseKeyValidationCronJob);
  });

  it('uses the same stable time for the queue and Sentry', async () => {
    await command.run();
    await command.run();
    await job.handle();

    const pattern = getOrganizationKeyValidationCronPattern('server-example');
    const sentryPattern = getOrganizationKeyValidationCronPattern(
      'server-example',
      { withSeconds: false },
    );

    for (const registration of messageQueueService.addCron.mock.calls) {
      expect(registration[0]).toEqual({
        jobName: EnterpriseKeyValidationCronJob.name,
        data: undefined,
        options: { repeat: { pattern, tz: 'UTC' } },
      });
    }

    expect(messageQueueService.addCron).toHaveBeenCalledTimes(2);
    expect(Sentry.withMonitor).toHaveBeenCalledWith(
      EnterpriseKeyValidationCronJob.name,
      expect.any(Function),
      expect.objectContaining({
        schedule: { type: 'crontab', value: sentryPattern },
        timezone: 'UTC',
      }),
    );
    expect(enterprisePlanService.refreshValidityToken).toHaveBeenCalledTimes(1);
    expect(enterprisePlanService.reportSeats).toHaveBeenCalledWith(2);
  });

  it('still reports seats after a failed refresh', async () => {
    enterprisePlanService.refreshValidityToken.mockRejectedValue(
      new Error('Billing service temporarily unavailable'),
    );

    await expect(job.handle()).resolves.toBeUndefined();

    expect(enterprisePlanService.reportSeats).toHaveBeenCalledWith(2);
  });

  it('preserves a matching fallback schedule when there is no persisted ID', async () => {
    enterprisePlanService.getOrCreateServerId.mockResolvedValue(null);

    await command.run();
    await job.handle();

    expect(messageQueueService.addCron).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { repeat: { pattern: '0 4 * * *', tz: 'UTC' } },
      }),
    );
    expect(Sentry.withMonitor).toHaveBeenCalledWith(
      EnterpriseKeyValidationCronJob.name,
      expect.any(Function),
      expect.objectContaining({
        schedule: { type: 'crontab', value: '0 4 * * *' },
      }),
    );
  });
});
