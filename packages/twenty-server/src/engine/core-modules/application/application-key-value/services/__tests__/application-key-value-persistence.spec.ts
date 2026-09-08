import { ForbiddenException } from '@nestjs/common';

import { ApplicationKeyValuePersistenceJob } from 'src/engine/core-modules/application/application-key-value/application-key-value-persistence.job';
import { ApplicationKeyValueResolver } from 'src/engine/core-modules/application/application-key-value/application-key-value.resolver';
import { AppKeyValueScope } from 'src/engine/core-modules/application/application-key-value/enums/app-key-value-scope.enum';
import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

const application = { id: 'application' } as FlatApplication;
const workspace = { id: 'workspace' } as FlatWorkspace;
const value = { status: 'READY', markdown: 'Paid summary' };
const input = { key: 'summary', value };

const add = jest.fn();
const setWorkspaceValue = jest.fn();
const service = { setWorkspaceValue } as unknown as ApplicationKeyValueService;
const resolver = new ApplicationKeyValueResolver(service, {
  add,
} as unknown as MessageQueueService);

beforeEach(() => jest.resetAllMocks());

it('acknowledges only after the queue accepts the output with authenticated ownership', async () => {
  let acknowledge: () => void = () => {};
  add.mockReturnValue(
    new Promise<void>((resolve) => {
      acknowledge = resolve;
    }),
  );
  let accepted = false;
  const pending = resolver
    .enqueueAppKeyValue(application, workspace, input)
    .then(() => {
      accepted = true;
    });
  await Promise.resolve();
  expect(accepted).toBe(false);
  expect(add).toHaveBeenCalledWith(
    ApplicationKeyValuePersistenceJob.name,
    {
      applicationId: application.id,
      workspaceId: workspace.id,
      ...input,
    },
    expect.objectContaining({ retainOnFailure: true, retryLimit: 1440 }),
  );
  acknowledge();
  await pending;
  expect(accepted).toBe(true);
});

it('does not acknowledge a queue failure', async () => {
  add.mockRejectedValue(new Error('Redis unavailable'));
  await expect(
    resolver.enqueueAppKeyValue(application, workspace, input),
  ).rejects.toThrow('Redis unavailable');
});

it('rejects server-scoped writes before dispatching', async () => {
  await expect(
    resolver.enqueueAppKeyValue(application, workspace, {
      ...input,
      scope: AppKeyValueScope.SERVER,
    }),
  ).rejects.toThrow(ForbiddenException);
  expect(add).not.toHaveBeenCalled();
});

it('retries the same output after a database outage without generating it again', async () => {
  const job = new ApplicationKeyValuePersistenceJob(service);
  const data = {
    applicationId: application.id,
    workspaceId: workspace.id,
    ...input,
  };
  setWorkspaceValue
    .mockRejectedValueOnce(new Error('Database unavailable'))
    .mockResolvedValueOnce({ ...input, scope: AppKeyValueScope.WORKSPACE });
  await expect(job.handle(data)).rejects.toThrow('Database unavailable');
  await job.handle(data);
  expect(setWorkspaceValue.mock.calls).toEqual([[data], [data]]);
});
