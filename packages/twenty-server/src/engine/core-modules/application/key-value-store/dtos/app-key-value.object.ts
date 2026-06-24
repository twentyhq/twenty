import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AppKeyValue')
export class AppKeyValueObjectDto {
  @Field()
  value: string;
}
