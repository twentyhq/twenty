import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SigningKeyDTO {
  @Field(() => ID)
  id: string;

  @Field()
  publicKey: string;

  @Field()
  isCurrent: boolean;

  @Field()
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  revokedAt: Date | null;

  @Field(() => Int)
  verifyCountInWindow: number;
}
