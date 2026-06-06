import { type AccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/access-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type PlaygroundTokenJwtPayload = Omit<
  AccessTokenJwtPayload,
  | 'type'
  | 'isImpersonating'
  | 'impersonatorUserWorkspaceId'
  | 'impersonatedUserWorkspaceId'
> & {
  type: JwtTokenTypeEnum.PLAYGROUND;
};
