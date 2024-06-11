import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { DateFormat, TimeFormat } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

registerEnumType(DateFormat, {
  name: "DateFormat",
  description: "Date format as Month first, Day first, Year first or system as default"
});

registerEnumType(TimeFormat, {
  name: "TimeFormat",
  description: "Time time as Military, Standard or system as default"
});

@ObjectType('FullName')
export class FullName {
  @Field({ nullable: false })
  firstName: string;

  @Field({ nullable: false })
  lastName: string;
}

@ObjectType('WorkspaceMember')
export class WorkspaceMember {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => FullName)
  name: FullName;

  @Field({ nullable: false })
  colorScheme: string;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field({ nullable: false })
  locale: string;

  @Field({ nullable: false, defaultValue: 'system' })
  preferredTimeZone: string;

  @Field(() => DateFormat)
  preferredDateFormat: DateFormat;

  @Field(() => TimeFormat)
  preferredTimeFormat: TimeFormat;
}
