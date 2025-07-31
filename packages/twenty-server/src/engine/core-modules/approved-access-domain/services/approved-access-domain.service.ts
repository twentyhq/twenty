import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { t } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { SendApprovedAccessDomainValidation } from 'twenty-emails';
import { Repository } from 'typeorm';

import { ApprovedAccessDomain as ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import {
  ApprovedAccessDomainException,
  ApprovedAccessDomainExceptionCode,
} from 'src/engine/core-modules/approved-access-domain/approved-access-domain.exception';
import { approvedAccessDomainValidator } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.validate';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkDomain } from 'src/utils/is-work-email';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class ApprovedAccessDomainService {
  constructor(
    @InjectRepository(ApprovedAccessDomainEntity, 'core')
    private readonly approvedAccessDomainRepository: Repository<ApprovedAccessDomainEntity>,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  async sendApprovedAccessDomainValidationEmail(
    sender: WorkspaceMemberWorkspaceEntity,
    to: string,
    workspace: Workspace,
    approvedAccessDomain: ApprovedAccessDomainEntity,
  ) {
    if (approvedAccessDomain.isValidated) {
      throw new ApprovedAccessDomainException(
        'Approved access domain has already been validated',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED,
        {
          userFriendlyMessage: t`Approved access domain has already been validated`,
        },
      );
    }

    if (to.split('@')[1] !== approvedAccessDomain.domain) {
      throw new ApprovedAccessDomainException(
        'Approved access domain does not match email domain',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL,
        {
          userFriendlyMessage: t`Approved access domain does not match email domain`,
        },
      );
    }

    const link = this.domainManagerService.buildWorkspaceURL({
      workspace,
      pathname: `settings/security`,
      searchParams: {
        wtdId: approvedAccessDomain.id,
        validationToken: this.generateUniqueHash(approvedAccessDomain),
      },
    });

    const emailTemplate = SendApprovedAccessDomainValidation({
      link: link.toString(),
      workspace: { name: workspace.displayName, logo: workspace.logo },
      domain: approvedAccessDomain.domain,
      sender: {
        email: sender.userEmail,
        firstName: sender.name.firstName,
        lastName: sender.name.lastName,
      },
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      locale: sender.locale,
    });
    const html = render(emailTemplate);
    const text = render(emailTemplate, {
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

  private generateUniqueHash(approvedAccessDomain: ApprovedAccessDomainEntity) {
    return crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          id: approvedAccessDomain.id,
          domain: approvedAccessDomain.domain,
          key: this.twentyConfigService.get('APP_SECRET'),
        }),
      )
      .digest('hex');
  }

  async validateApprovedAccessDomain({
    validationToken,
    approvedAccessDomainId,
  }: {
    validationToken: string;
    approvedAccessDomainId: string;
  }) {
    const approvedAccessDomain =
      await this.approvedAccessDomainRepository.findOneBy({
        id: approvedAccessDomainId,
      });

    approvedAccessDomainValidator.assertIsDefinedOrThrow(approvedAccessDomain);

    if (approvedAccessDomain.isValidated) {
      throw new ApprovedAccessDomainException(
        'Approved access domain has already been validated',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VALIDATED,
        {
          userFriendlyMessage: t`Approved access domain has already been validated`,
        },
      );
    }

    const isHashValid =
      this.generateUniqueHash(approvedAccessDomain) === validationToken;

    if (!isHashValid) {
      throw new ApprovedAccessDomainException(
        'Invalid approved access domain validation token',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    return await this.approvedAccessDomainRepository.save({
      ...approvedAccessDomain,
      isValidated: true,
    });
  }

  async createApprovedAccessDomain(
    domain: string,
    inWorkspace: Workspace,
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
    workspace: Workspace,
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

  async getApprovedAccessDomains(workspace: Workspace) {
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
