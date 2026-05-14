import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { SendApprovedAccessDomainValidation } from 'twenty-emails';
import { FileFolder, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import {
  ApprovedAccessDomainException,
  ApprovedAccessDomainExceptionCode,
} from 'src/engine/core-modules/approved-access-domain/approved-access-domain.exception';
import { approvedAccessDomainValidator } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.validate';
import {
  type ApprovedAccessDomainJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { decodeJwtHeader } from 'src/engine/core-modules/jwt/utils/decode-jwt-header.util';
import { isAsymmetricJwtHeader } from 'src/engine/core-modules/jwt/utils/is-asymmetric-jwt-header.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkDomain } from 'src/utils/is-work-email';

const APPROVED_ACCESS_DOMAIN_TOKEN_EXPIRES_IN = '7d';

@Injectable()
export class ApprovedAccessDomainService {
  private readonly logger = new Logger(ApprovedAccessDomainService.name);

  constructor(
    @InjectRepository(ApprovedAccessDomainEntity)
    private readonly approvedAccessDomainRepository: Repository<ApprovedAccessDomainEntity>,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileUrlService: FileUrlService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  async sendApprovedAccessDomainValidationEmail(
    sender: WorkspaceMemberWorkspaceEntity,
    to: string,
    workspace: WorkspaceEntity,
    approvedAccessDomain: ApprovedAccessDomainEntity,
  ) {
    if (approvedAccessDomain.isValidated) {
      throw new ApprovedAccessDomainException(
        'Approved access domain has already been validated',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED,
        {
          userFriendlyMessage: msg`Approved access domain has already been validated`,
        },
      );
    }

    if (to.split('@')[1] !== approvedAccessDomain.domain) {
      throw new ApprovedAccessDomainException(
        'Approved access domain does not match email domain',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL,
        {
          userFriendlyMessage: msg`Approved access domain does not match email domain`,
        },
      );
    }

    const link = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: getSettingsPath(SettingsPath.WorkspaceMembersPage),
      searchParams: {
        wtdId: approvedAccessDomain.id,
        validationToken: await this.mintValidationToken({
          approvedAccessDomain,
          workspaceId: workspace.id,
        }),
      },
    });

    if (!isDefined(sender.userEmail)) {
      throw new Error(`Sender ${sender.id} has an empty userEmail`);
    }

    const logo = isDefined(workspace.logoFileId)
      ? await this.fileUrlService.signFileByIdUrl({
          fileId: workspace.logoFileId,
          workspaceId: workspace.id,
          fileFolder: FileFolder.CorePicture,
        })
      : undefined;

    const emailTemplate = SendApprovedAccessDomainValidation({
      link: link.toString(),
      workspace: {
        name: workspace.displayName,
        logo,
      },
      domain: approvedAccessDomain.domain,
      sender: {
        email: sender.userEmail,
        firstName: sender.name.firstName,
        lastName: sender.name.lastName,
      },
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      locale: sender.locale,
    });
    const html = await render(emailTemplate);
    const text = await render(emailTemplate, {
      plainText: true,
    });

    await this.emailService.send({
      from: `${sender.name.firstName} ${sender.name.lastName} (via Twenty) <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      to,
      subject: 'Approve your access domain',
      text,
      html,
    });
  }

  private async mintValidationToken({
    approvedAccessDomain,
    workspaceId,
  }: {
    approvedAccessDomain: ApprovedAccessDomainEntity;
    workspaceId: string;
  }): Promise<string> {
    return this.jwtWrapperService.signAsyncOrThrow(
      {
        sub: approvedAccessDomain.id,
        type: JwtTokenTypeEnum.APPROVED_ACCESS_DOMAIN,
        workspaceId,
        approvedAccessDomainId: approvedAccessDomain.id,
        domain: approvedAccessDomain.domain,
      },
      { expiresIn: APPROVED_ACCESS_DOMAIN_TOKEN_EXPIRES_IN },
    );
  }

  private async verifyValidationTokenOrThrow(
    validationToken: string,
  ): Promise<ApprovedAccessDomainJwtPayload> {
    if (!isAsymmetricJwtHeader(decodeJwtHeader(validationToken))) {
      throw new ApprovedAccessDomainException(
        'Invalid approved access domain validation token',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    let payload: ApprovedAccessDomainJwtPayload;

    try {
      payload = (await this.jwtWrapperService.verifyJwtToken(
        validationToken,
      )) as ApprovedAccessDomainJwtPayload;
    } catch (error) {
      this.logger.warn(
        `Rejected approved-access-domain validation token: ${
          error instanceof Error ? error.message : 'unknown reason'
        }`,
      );

      throw new ApprovedAccessDomainException(
        'Invalid approved access domain validation token',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    if (payload.type !== JwtTokenTypeEnum.APPROVED_ACCESS_DOMAIN) {
      throw new ApprovedAccessDomainException(
        'Invalid approved access domain validation token',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    return payload;
  }

  async validateApprovedAccessDomain({
    validationToken,
    approvedAccessDomainId,
  }: {
    validationToken: string;
    approvedAccessDomainId: string;
  }) {
    const payload = await this.verifyValidationTokenOrThrow(validationToken);

    if (payload.approvedAccessDomainId !== approvedAccessDomainId) {
      throw new ApprovedAccessDomainException(
        'Invalid approved access domain validation token',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    const approvedAccessDomain =
      await this.approvedAccessDomainRepository.findOneBy({
        id: approvedAccessDomainId,
      });

    approvedAccessDomainValidator.assertIsDefinedOrThrow(approvedAccessDomain);

    if (
      payload.domain !== approvedAccessDomain.domain ||
      payload.workspaceId !== approvedAccessDomain.workspaceId
    ) {
      throw new ApprovedAccessDomainException(
        'Invalid approved access domain validation token',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    if (approvedAccessDomain.isValidated) {
      throw new ApprovedAccessDomainException(
        'Approved access domain has already been validated',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VALIDATED,
        {
          userFriendlyMessage: msg`Approved access domain has already been validated`,
        },
      );
    }

    return await this.approvedAccessDomainRepository.save({
      ...approvedAccessDomain,
      isValidated: true,
    });
  }

  async createApprovedAccessDomain(
    domain: string,
    inWorkspace: WorkspaceEntity,
    fromWorkspaceMember: WorkspaceMemberWorkspaceEntity,
    emailToValidateDomain: string,
  ): Promise<ApprovedAccessDomainEntity> {
    if (!isWorkDomain(domain)) {
      throw new ApprovedAccessDomainException(
        'Approved access domain must be a company domain',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_MUST_BE_A_COMPANY_DOMAIN,
      );
    }

    if (
      await this.approvedAccessDomainRepository.findOneBy({
        domain,
        workspaceId: inWorkspace.id,
      })
    ) {
      throw new ApprovedAccessDomainException(
        'Approved access domain already registered.',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_REGISTERED,
        {
          userFriendlyMessage: msg`Approved access domain already registered.`,
        },
      );
    }

    const approvedAccessDomain = await this.approvedAccessDomainRepository.save(
      {
        workspaceId: inWorkspace.id,
        domain,
      },
    );

    await this.sendApprovedAccessDomainValidationEmail(
      fromWorkspaceMember,
      emailToValidateDomain,
      inWorkspace,
      approvedAccessDomain,
    );

    return approvedAccessDomain;
  }

  async deleteApprovedAccessDomain(
    workspace: WorkspaceEntity,
    approvedAccessDomainId: string,
  ) {
    const approvedAccessDomain =
      await this.approvedAccessDomainRepository.findOneBy({
        id: approvedAccessDomainId,
        workspaceId: workspace.id,
      });

    approvedAccessDomainValidator.assertIsDefinedOrThrow(approvedAccessDomain);

    await this.approvedAccessDomainRepository.delete({
      id: approvedAccessDomain.id,
    });
  }

  async getApprovedAccessDomains(workspace: WorkspaceEntity) {
    return await this.approvedAccessDomainRepository.find({
      where: {
        workspaceId: workspace.id,
      },
    });
  }

  async findValidatedApprovedAccessDomainWithWorkspacesAndSSOIdentityProvidersDomain(
    domain: string,
  ) {
    return await this.approvedAccessDomainRepository.find({
      relations: [
        'workspace',
        'workspace.workspaceSSOIdentityProviders',
        'workspace.approvedAccessDomains',
      ],
      where: {
        domain,
        isValidated: true,
      },
    });
  }
}
