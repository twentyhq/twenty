import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordShareGrantInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/record-share-grant.input';

@InputType('ShareInboxThreadInput')
export class ShareInboxThreadInputDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  threadId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecordShareGrantInputDTO)
  @Field(() => [RecordShareGrantInputDTO])
  grants: RecordShareGrantInputDTO[];
}
