import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { parse, validate, validateSchema } from 'graphql';

import { ApplicationDevelopmentResolver } from 'src/engine/core-modules/application/application-development/application-development.resolver';
import { ApplicationExportResolver } from 'src/engine/core-modules/application/application-development/application-export.resolver';

it('accepts both legacy file uploads and uploads with content reuse', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );

  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([ApplicationDevelopmentResolver, ApplicationExportResolver]);
    expect(validateSchema(schema)).toEqual([]);

    for (const reuse of [false, true]) {
      expect(
        validate(
          schema,
          parse(`mutation {
        createApplicationFileUploads(applicationUniversalIdentifier: "app", files: [{
          fileFolder: Source, filePath: "src/file.ts", size: 10
          ${reuse ? `sha256: "${'a'.repeat(64)}"` : ''}
        }]) {
          targets { fileId filePath uploadUrl contentType }
          errors { filePath message }
          ${reuse ? 'unchangedFiles { fileFolder filePath }' : ''}
        }
      }`),
        ),
      ).toEqual([]);
    }
  } finally {
    await application.close();
  }
});
