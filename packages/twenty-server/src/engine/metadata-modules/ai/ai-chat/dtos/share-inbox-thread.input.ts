import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordShareGrantInput } from 'src/engine/core-modules/record-share/dtos/record-share-grant.input';

@InputType('ShareInboxThreadInput')
export class ShareInboxThreadInputDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  threadId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecordShareGrantInput)
  @Field(() => [RecordShareGrantInput])
  grants: RecordShareGrantInput[];
}
