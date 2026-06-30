import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import {
  type ExistingUserOrNewUser,
  type ExistingUserOrPartialUserWithPicture,
  type SignInUpNewUserPayload,
} from 'src/engine/core-modules/auth/types/signInUp.type';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

export type SaasAuthBusinessInput = {
  businessId?: string | number;
  displayName?: string;
  id?: string | number;
  name?: string;
};

export type SaasAuthValidateResponseInput = {
  businesses?: SaasAuthBusinessInput[];
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
};

export type SaasProvisionedBusiness = {
  id: string;
  name: string;
  workspaceId: string;
};

export type SaasProvisionedLogin = {
  businesses: SaasProvisionedBusiness[];
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
};

type NormalizedSaasBusiness = {
  id: string;
  name: string;
};

@Injectable()
export class SaasAuthWorkspaceService {
  constructor(
    private readonly authService: AuthService,
    private readonly signInUpService: SignInUpService,
    private readonly onboardingService: OnboardingService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async provisionWorkspaces(
    validateResponse: SaasAuthValidateResponseInput,
  ): Promise<SaasProvisionedLogin> {
    const userPayload = this.buildUserPayload(validateResponse);
    const businesses = this.normalizeBusinesses(validateResponse.businesses);

    let userData = this.authService.formatUserDataPayload(
      userPayload,
      await this.userService.findUserByEmail(userPayload.email),
    ).userData;

    const provisionedBusinesses: SaasProvisionedBusiness[] = [];

    for (const business of businesses) {
      const { user, workspace } = await this.provisionWorkspaceForBusiness({
        business,
        userData,
      });

      await this.onboardingService.completeOnboardingProfileStepIfNameProvided({
        userId: user.id,
        workspaceId: workspace.id,
        firstName: userPayload.firstName ?? undefined,
        lastName: userPayload.lastName ?? undefined,
      });

      await this.onboardingService.setOnboardingInviteTeamPending({
        workspaceId: workspace.id,
        value: false,
      });

      userData = {
        type: 'existingUser',
        existingUser: user,
      };

      provisionedBusinesses.push({
        id: business.id,
        name: business.name,
        workspaceId: workspace.id,
      });
    }

    return {
      user: {
        email: userPayload.email,
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
      },
      businesses: provisionedBusinesses,
    };
  }

  private async provisionWorkspaceForBusiness({
    business,
    userData,
  }: {
    business: NormalizedSaasBusiness;
    userData: ExistingUserOrNewUser['userData'];
  }): Promise<{ user: UserEntity; workspace: WorkspaceEntity }> {
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { saasAuthBusinessId: business.id },
    });

    if (existingWorkspace) {
      const roleId = await this.getAdminRoleIdForNewUser({
        userData,
        workspaceId: existingWorkspace.id,
      });

      return await this.authService.signInUp({
        userData,
        workspace: existingWorkspace,
        roleId,
        authParams: {
          provider: AuthProviderEnum.SSO,
        },
      });
    }

    return await this.signInUpService.signUpOnNewWorkspace(
      await this.toWorkspaceCreationUserData(userData),
      {
        displayName: business.name,
        saasAuthBusinessId: business.id,
      },
    );
  }

  private async getAdminRoleIdForNewUser({
    userData,
    workspaceId,
  }: {
    userData: ExistingUserOrNewUser['userData'];
    workspaceId: string;
  }): Promise<string | undefined> {
    if (userData.type !== 'newUser') {
      return undefined;
    }

    const adminRole = await this.roleService.getRoleByUniversalIdentifier({
      workspaceId,
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
    });

    return adminRole?.id;
  }

  private async toWorkspaceCreationUserData(
    userData: ExistingUserOrNewUser['userData'],
  ): Promise<ExistingUserOrPartialUserWithPicture['userData']> {
    if (userData.type === 'existingUser') {
      return userData;
    }

    return {
      type: 'newUserWithPicture',
      newUserWithPicture:
        await this.signInUpService.computePartialUserFromUserPayload(
          userData.newUserPayload,
          {
            provider: AuthProviderEnum.SSO,
          },
        ),
    };
  }

  private buildUserPayload(
    validateResponse: SaasAuthValidateResponseInput,
  ): SignInUpNewUserPayload {
    const email = validateResponse.user?.email ?? validateResponse.email;

    if (!email) {
      throw new AuthException(
        'Email not found from SaaS authentication provider',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }

    const splitName = this.splitName(
      validateResponse.user?.name ?? validateResponse.name,
    );

    return {
      email,
      firstName:
        validateResponse.user?.firstName ??
        validateResponse.firstName ??
        splitName.firstName,
      lastName:
        validateResponse.user?.lastName ??
        validateResponse.lastName ??
        splitName.lastName,
      isEmailAlreadyVerified: true,
    };
  }

  private normalizeBusinesses(
    businesses: SaasAuthBusinessInput[] = [],
  ): NormalizedSaasBusiness[] {
    return businesses.flatMap((business) => {
      const businessId = String(business.id ?? business.businessId ?? '');

      if (!businessId) {
        return [];
      }

      return [
        {
          id: businessId,
          name:
            business.name ?? business.displayName ?? `Business ${businessId}`,
        },
      ];
    });
  }

  private splitName(name?: string): {
    firstName?: string | null;
    lastName?: string | null;
  } {
    if (!name) {
      return {};
    }

    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);

    return {
      firstName,
      lastName: lastNameParts.length > 0 ? lastNameParts.join(' ') : null,
    };
  }
}
