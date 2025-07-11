import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('File')
export class FileDTO {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  fullPath: string;

  @Field()
  size: number;

  @Field()
  type: string;

  @Field()
  createdAt: Date;
}
