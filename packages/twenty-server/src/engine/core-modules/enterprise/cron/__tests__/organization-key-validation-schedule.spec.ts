import { Test } from '@nestjs/testing';
import * as Sentry from '@sentry/node';

import { EnterpriseKeyValidationCronCommand } from 'src/engine/core-modules/enterprise/cron/command/organization-key-validation.cron.command';
import { EnterpriseKeyValidationCronJob } from 'src/engine/core-modules/enterprise/cron/jobs/organization-key-validation.cron.job';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { getOrganizationKeyValidationCronPattern } from 'src/engine/core-modules/enterprise/utils/get-organization-key-validation-cron-pattern.util';
import { toMinuteLevelCronPattern } from 'src/engine/core-modules/enterprise/utils/to-minute-level-cron-pattern.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

jest.mock('@sentry/node', () => ({
  isInitialized: jest.fn(() => true),
  captureCheckIn: jest.fn(() => 'check-in-id'),
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

  const registeredJobData = () =>
    messageQueueService.addCron.mock.lastCall?.[0].data;

  const expectSentrySchedule = (value: string) =>
    expect(Sentry.captureCheckIn).toHaveBeenCalledWith(
      {
        monitorSlug: EnterpriseKeyValidationCronJob.name,
        status: 'in_progress',
      },
      expect.objectContaining({
        schedule: { type: 'crontab', value },
        timezone: 'UTC',
      }),
    );

  it('registers a stable time and hands it to the job for Sentry', async () => {
    await command.run();
    await command.run();

    const pattern = getOrganizationKeyValidationCronPattern('server-example');

    for (const registration of messageQueueService.addCron.mock.calls) {
      expect(registration[0]).toEqual({
        jobName: EnterpriseKeyValidationCronJob.name,
        data: { cronPattern: pattern },
        options: { repeat: { pattern, tz: 'UTC' } },
      });
    }

    await job.handle(registeredJobData());

    expectSentrySchedule(toMinuteLevelCronPattern(pattern));
    expect(enterprisePlanService.refreshValidityToken).toHaveBeenCalledTimes(1);
    expect(enterprisePlanService.reportSeats).toHaveBeenCalledWith(2);
  });

  it('keeps Sentry on the registered fallback after the server ID becomes available', async () => {
    enterprisePlanService.getOrCreateServerId.mockResolvedValueOnce(null);

    await command.run();
    await job.handle(registeredJobData());

    expect(messageQueueService.addCron).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { repeat: { pattern: '0 4 * * *', tz: 'UTC' } },
      }),
    );
    expectSentrySchedule('0 4 * * *');
    expect(enterprisePlanService.getOrCreateServerId).toHaveBeenCalledTimes(1);
  });

  it('assumes 04:00 for a scheduler registered by an older version', async () => {
    await job.handle(undefined);

    expectSentrySchedule('0 4 * * *');
  });

  it('still reports seats after a failed refresh', async () => {
    enterprisePlanService.refreshValidityToken.mockRejectedValue(
      new Error('Billing service temporarily unavailable'),
    );

    await expect(job.handle(undefined)).resolves.toBeUndefined();

    expect(enterprisePlanService.reportSeats).toHaveBeenCalledWith(2);
  });
});
