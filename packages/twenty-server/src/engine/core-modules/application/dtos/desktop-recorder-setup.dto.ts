import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('DesktopRecorderSetup')
export class DesktopRecorderSetupDTO {
  @Field(() => Boolean)
  installed: boolean;

  @Field(() => String, { nullable: true })
  downloadUrl: string | null;
}
