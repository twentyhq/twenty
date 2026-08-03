import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PersonDuplicatePhone')
export class PersonDuplicatePhoneDTO {
  @Field()
  number: string;

  @Field()
  countryCode: string;

  @Field()
  callingCode: string;
}

@ObjectType('PersonDuplicateLink')
export class PersonDuplicateLinkDTO {
  @Field()
  label: string;

  @Field()
  url: string;
}

@ObjectType('PersonDuplicateCompany')
export class PersonDuplicateCompanyDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  name: string;
}

@ObjectType('PersonDuplicatePerson')
export class PersonDuplicatePersonDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [String])
  emails: string[];

  @Field(() => [PersonDuplicatePhoneDTO])
  phones: PersonDuplicatePhoneDTO[];

  @Field(() => [PersonDuplicateLinkDTO])
  linkedinLinks: PersonDuplicateLinkDTO[];

  @Field()
  jobTitle: string;

  @Field(() => PersonDuplicateCompanyDTO, { nullable: true })
  company: PersonDuplicateCompanyDTO | null;

  @Field()
  avatarUrl: string;

  @Field()
  createdByName: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('PersonDuplicateGroup')
export class PersonDuplicateGroupDTO {
  @Field()
  id: string;

  @Field(() => [String])
  reasons: string[];

  @Field()
  detectedAt: Date;

  @Field(() => [PersonDuplicatePersonDTO])
  people: PersonDuplicatePersonDTO[];
}

@ObjectType('PersonDuplicateGroups')
export class PersonDuplicateGroupsDTO {
  @Field(() => [PersonDuplicateGroupDTO])
  groups: PersonDuplicateGroupDTO[];

  @Field()
  totalCount: number;

  @Field()
  canResolve: boolean;
}

@InputType('PersonDuplicatePairInput')
export class PersonDuplicatePairInput {
  @Field(() => UUIDScalarType)
  leftPersonId: string;

  @Field(() => UUIDScalarType)
  rightPersonId: string;
}
