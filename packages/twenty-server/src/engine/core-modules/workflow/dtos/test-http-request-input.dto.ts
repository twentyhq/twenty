import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowHttpRequestActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';

@InputType()
export class TestHttpRequestInput {
  @Field(() => String, {
    description: 'URL to make the request to',
    nullable: false,
  })
  url: WorkflowHttpRequestActionInput['url'];

  @Field(() => String, {
    description: 'HTTP method',
    nullable: false,
  })
  method: WorkflowHttpRequestActionInput['method'];

  @Field(() => graphqlTypeJson, {
    description: 'HTTP headers',
    nullable: true,
  })
  headers?: WorkflowHttpRequestActionInput['headers'];

  @Field(() => graphqlTypeJson, {
    description: 'Request body',
    nullable: true,
  })
  body?: WorkflowHttpRequestActionInput['body'];
}
