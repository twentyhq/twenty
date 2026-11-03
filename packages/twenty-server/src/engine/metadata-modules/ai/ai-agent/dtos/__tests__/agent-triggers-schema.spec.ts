import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import {
  coerceInputValue,
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  isInputObjectType,
  isObjectType,
} from 'graphql';

import { AgentResolver } from 'src/engine/metadata-modules/ai/ai-agent/agent.resolver';

it('roundtrips retained null trigger items through the update and output schema while keeping create strict', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );
  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([AgentResolver]);
    const agentType = schema.getType('Agent');
    const updateInputType = schema.getType('UpdateAgentInput');
    const createInputType = schema.getType('CreateAgentInput');
    if (
      !isObjectType(agentType) ||
      !isInputObjectType(updateInputType) ||
      !isInputObjectType(createInputType)
    ) {
      throw new Error('Agent schema types are missing');
    }
    const triggers = [
      null,
      { type: 'FUTURE_TRIGGER', settings: { retained: true } },
    ];
    const triggerInputType = updateInputType.getFields().triggers.type;
    const createTriggerInputType = createInputType.getFields().triggers.type;
    expect(String(agentType.getFields().triggers.type)).toBe('[JSON]!');
    expect(String(triggerInputType)).toBe('[JSON]');
    expect(coerceInputValue(triggers, triggerInputType)).toEqual(triggers);
    expect(() => coerceInputValue(triggers, createTriggerInputType)).toThrow();
    const outputSchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'TriggerQuery',
        fields: { agent: { type: agentType, resolve: () => ({ triggers }) } },
      }),
    });
    const result = await graphql({
      schema: outputSchema,
      source: '{ agent { triggers } }',
    });
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({ agent: { triggers } });
  } finally {
    await application.close();
  }
});
