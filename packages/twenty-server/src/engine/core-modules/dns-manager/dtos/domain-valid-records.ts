import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
class DomainRecord {
  @Field(() => String)
  validationType: 'ssl' | 'redirection';

  @Field(() => String)
  type: 'cname';

  @Field(() => String)
  status: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class DomainValidRecords {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  domain: string;

  @Field(() => [DomainRecord])
  records: Array<DomainRecord>;
}
