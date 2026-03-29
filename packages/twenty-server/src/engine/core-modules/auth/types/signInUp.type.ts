import { type APP_LOCALES } from 'twenty-shared/translations';

import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type SocialSSOSignInUpActionType =
  | 'create-new-workspace'
  | 'list-available-workspaces'
  | 'join-workspace';

export type SignInUpBaseParams = {
  invitation?: AppTokenEntity;
  workspace?: WorkspaceEntity | null;
  billingCheckoutSessionState?: string | null;
};

export type SignInUpNewUserPayload = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
  passwordHash?: string | null;
  locale?: keyof typeof APP_LOCALES | null;
  isEmailAlreadyVerified?: boolean;
};

export type PartialUserWithPicture = {
  picture?: string;
} & Partial<UserEntity>;

export type ExistingUserOrNewUser = {
  userData:
    | { type: 'existingUser'; existingUser: UserEntity }
    | {
        type: 'newUser';
        newUserPayload: SignInUpNewUserPayload;
      };
};

export type ExistingUserOrPartialUserWithPicture = {
  userData:
    | { type: 'existingUser'; existingUser: UserEntity }
    | {
        type: 'newUserWithPicture';
        newUserWithPicture: PartialUserWithPicture;
      };
};

export type AuthProviderWithPasswordType = {
  authParams:
    | {
        provider: Extract<AuthProviderEnum, AuthProviderEnum.Password>;
        password: string;
      }
    | {
        provider: Exclude<AuthProviderEnum, AuthProviderEnum.Password>;
      };
};
