import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { parse, validate } from 'graphql';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';

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
