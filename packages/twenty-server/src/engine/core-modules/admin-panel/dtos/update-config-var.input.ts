import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateConfigVarInput {
  @Field(() => String)
  key: string;

  @Field(() => String)
  value: any;
}
