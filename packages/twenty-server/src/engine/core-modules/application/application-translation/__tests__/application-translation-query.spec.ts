import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { parse, validate } from 'graphql';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { type ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

it('exposes a non-null catalog with required UUID application and locale arguments', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );
  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([ApplicationResolver]);
    const field = schema
      .getQueryType()
      ?.getFields().applicationTranslationCatalog;
    expect(String(field?.type)).toBe('JSON!');
    expect(field?.args.map(({ name, type }) => [name, String(type)])).toEqual([
      ['applicationId', 'UUID!'],
      ['locale', 'String!'],
    ]);
    expect(
      validate(
        schema,
        parse(
          'query Catalog($applicationId: UUID!, $locale: String!) { applicationTranslationCatalog(applicationId: $applicationId, locale: $locale) }',
        ),
      ),
    ).toEqual([]);
  } finally {
    await application.close();
  }
});

it('only reads catalogs of applications installed in the authenticated workspace', async () => {
  const cache = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatApplicationMaps: {
        byId: {
          installed: { applicationRegistrationId: 'registration' },
          local: { applicationRegistrationId: null },
        },
      },
    }),
  };
  const translations = {
    getCurrentCatalog: jest.fn().mockResolvedValue({ label: 'Bonjour' }),
  };
  const resolver = new ApplicationResolver(
    {} as TwentyConfigService,
    cache as unknown as WorkspaceCacheService,
    {} as ApplicationStopService,
    {} as ApplicationService,
    translations as unknown as ApplicationTranslationCacheService,
  );
  const workspace = { id: 'workspace' } as WorkspaceEntity;
  expect(
    await resolver.applicationTranslationCatalog(
      'installed',
      'fr-FR',
      workspace,
    ),
  ).toEqual({ label: 'Bonjour' });
  expect(cache.getOrRecompute).toHaveBeenCalledWith('workspace', [
    'flatApplicationMaps',
  ]);
  expect(translations.getCurrentCatalog).toHaveBeenCalledWith({
    applicationRegistrationId: 'registration',
    locale: 'fr-FR',
  });
  expect(
    await resolver.applicationTranslationCatalog(
      'another-workspace-app',
      'fr-FR',
      workspace,
    ),
  ).toEqual({});
  expect(
    await resolver.applicationTranslationCatalog('local', 'fr-FR', workspace),
  ).toEqual({});
  await expect(
    resolver.applicationTranslationCatalog('installed', 'invalid', workspace),
  ).rejects.toThrow('Unsupported translation locale');
  expect(translations.getCurrentCatalog).toHaveBeenCalledTimes(1);
});
