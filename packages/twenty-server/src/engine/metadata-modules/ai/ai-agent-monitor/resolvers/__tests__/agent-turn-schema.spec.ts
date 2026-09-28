import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { validateSchema } from 'graphql';

import { AgentTurnResolver } from 'src/engine/metadata-modules/ai/ai-agent-monitor/resolvers/agent-turn.resolver';

it('builds the agent turn schema with its field resolvers', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );
  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([AgentTurnResolver]);
    expect(validateSchema(schema)).toEqual([]);
    expect(schema.getQueryType()?.getFields()).toHaveProperty('agentTurns');
    expect(schema.getMutationType()?.getFields()).toHaveProperty(
      'runEvaluationInput',
    );
  } finally {
    await application.close();
  }
});
