jest.mock(
  'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service',
  () => ({ CoreWorkflowMutationWorkspaceService: class {} }),
);
jest.mock(
  'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service',
  () => ({ CoreWorkflowLifecycleWorkspaceService: class {} }),
);
import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { parse, validate, validateSchema } from 'graphql';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GettingStartedResolver } from 'src/engine/core-modules/getting-started/getting-started.resolver';
import { GettingStartedHandoverResolver } from 'src/engine/core-modules/getting-started/getting-started-handover.resolver';

it('validates the frontend documents against the generated resolver schema', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );
  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([GettingStartedResolver, GettingStartedHandoverResolver]);
    expect(validateSchema(schema)).toEqual([]);
    const source = readFileSync(
      resolve(
        '../twenty-front/src/modules/getting-started/graphql/gettingStarted.ts',
      ),
      'utf8',
    );
    for (const match of source.matchAll(/gql`([\s\S]*?)`/g))
      expect(validate(schema, parse(match[1]))).toEqual([]);
  } finally {
    await application.close();
  }
});
