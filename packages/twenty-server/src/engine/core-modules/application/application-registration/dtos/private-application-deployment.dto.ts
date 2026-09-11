import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';

@ObjectType('PrivateApplicationDeployment')
export class PrivateApplicationDeploymentDTO {
  @Field(() => UUIDScalarType)
  deploymentId: string;

  @Field(() => FileUploadTargetDTO)
  tarball: FileUploadTargetDTO;

  @Field(() => FileUploadTargetDTO, { nullable: true })
  logo: FileUploadTargetDTO | null;
}
