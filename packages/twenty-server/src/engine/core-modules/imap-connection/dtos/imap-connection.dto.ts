import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImapConnectionParams {
  @Field(() => String)
  handle: string;

  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  /**
   * Note: This field is stored in plain text in the database.
   * While encrypting it could provide an extra layer of defense, we have decided not to,
   * as database access implies a broader compromise. For context, see discussion in PR #12576.
   */
  @Field(() => String)
  password: string;

  @Field(() => Boolean)
  secure: boolean;
}
