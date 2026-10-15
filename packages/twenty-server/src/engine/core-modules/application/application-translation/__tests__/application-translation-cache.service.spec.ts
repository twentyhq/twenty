import { type Repository } from 'typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

it('reads the current active-locale catalog even when another process changed the database', async () => {
  const translations = {
    findOne: jest
      .fn()
      .mockResolvedValueOnce({ messages: { label: 'Old' } })
      .mockResolvedValueOnce({ messages: { label: 'New' } })
      .mockResolvedValueOnce(null),
  };
  const service = new ApplicationTranslationCacheService(
    translations as unknown as Repository<ApplicationTranslationEntity>,
    {} as Repository<ApplicationEntity>,
    {} as WorkspaceEventBroadcaster,
  );
  const input = {
    applicationRegistrationId: 'registration',
    locale: 'fr-FR' as const,
  };
  expect(await service.getCurrentCatalog(input)).toEqual({ label: 'Old' });
  expect(await service.getCurrentCatalog(input)).toEqual({ label: 'New' });
  expect(await service.getCurrentCatalog(input)).toEqual({});
  expect(translations.findOne).toHaveBeenCalledWith({
    where: input,
    select: { messages: true },
  });
  expect(await service.getCurrentCatalog({ ...input, locale: 'en' })).toEqual(
    {},
  );
  expect(translations.findOne).toHaveBeenCalledTimes(3);
});

it('notifies every workspace installation without sending catalog content', async () => {
  const applications = {
    find: jest.fn().mockResolvedValue([
      { id: 'app-a', workspaceId: 'workspace-a' },
      { id: 'app-b', workspaceId: 'workspace-b' },
    ]),
  };
  const broadcaster = { broadcast: jest.fn() };
  const service = new ApplicationTranslationCacheService(
    {} as Repository<ApplicationTranslationEntity>,
    applications as unknown as Repository<ApplicationEntity>,
    broadcaster as unknown as WorkspaceEventBroadcaster,
  );
  await service.invalidate('registration');
  expect(broadcaster.broadcast).not.toHaveBeenCalled();
  await service.notifyCatalogUpdated('registration');
  expect(applications.find).toHaveBeenCalledWith({
    where: { applicationRegistrationId: 'registration' },
    select: { id: true, workspaceId: true },
  });
  expect(broadcaster.broadcast).toHaveBeenCalledTimes(2);
  for (const suffix of ['a', 'b']) {
    expect(broadcaster.broadcast).toHaveBeenCalledWith({
      workspaceId: `workspace-${suffix}`,
      events: [
        {
          type: 'updated',
          entityName: 'application',
          recordId: `app-${suffix}`,
          properties: {
            updatedFields: ['translationCatalog'],
            after: { id: `app-${suffix}`, translationCatalogUpdated: true },
          },
        },
      ],
    });
  }
});
