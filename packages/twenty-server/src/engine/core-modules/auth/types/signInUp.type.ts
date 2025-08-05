import { APP_LOCALES } from 'twenty-shared/translations';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type SocialSSOSignInUpActionType =
  | 'create-new-workspace'
  | 'list-available-workspaces'
  | 'join-workspace';

export type SignInUpBaseParams = {
  invitation?: AppToken;
  workspace?: Workspace | null;
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
} & Partial<User>;

export type ExistingUserOrNewUser = {
  userData:
    | { type: 'existingUser'; existingUser: User }
    | {
        type: 'newUser';
        newUserPayload: SignInUpNewUserPayload;
      };
};

export type ExistingUserOrPartialUserWithPicture = {
  userData:
    | { type: 'existingUser'; existingUser: User }
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
