import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class ComputeServerlessFunctionInputSchemaInput {
  @Field(() => ID, {
    description: 'Serverless function ID',
    nullable: false,
  })
  serverlessFunctionId: string;

  @Field(() => String, {
    description: 'Serverless function version',
    nullable: false,
  })
  serverlessFunctionVersion: string;
}
