import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type FileUploadTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.FILE_UPLOAD;
  workspaceId: string;
  fileId: string;
};
