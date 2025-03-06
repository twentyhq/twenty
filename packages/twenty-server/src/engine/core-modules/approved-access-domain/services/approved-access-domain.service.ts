import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { render } from '@react-email/render';
import { Repository } from 'typeorm';
import { APP_LOCALES } from 'twenty-shared';
import { SendApprovedAccessDomainValidation } from 'twenty-emails';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ApprovedAccessDomain as ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { approvedAccessDomainValidator } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.validate';
import {
  ApprovedAccessDomainException,
  ApprovedAccessDomainExceptionCode,
} from 'src/engine/core-modules/approved-access-domain/approved-access-domain.exception';
import { isWorkDomain } from 'src/utils/is-work-email';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class ApprovedAccessDomainService {
  constructor(
    @InjectRepository(ApprovedAccessDomainEntity, 'core')
    private readonly approvedAccessDomainRepository: Repository<ApprovedAccessDomainEntity>,
    private readonly emailService: EmailService,
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  async sendApprovedAccessDomainValidationEmail(
    sender: User,
    to: string,
    workspace: Workspace,
    approvedAccessDomain: ApprovedAccessDomainEntity,
  ) {
    if (approvedAccessDomain.isValidated) {
      throw new ApprovedAccessDomainException(
        'Approved access domain has already been validated',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED,
      );
    }

    if (to.split('@')[1] !== approvedAccessDomain.domain) {
      throw new ApprovedAccessDomainException(
        'Approved access domain does not match email domain',
        ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL,
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
        email: sender.email,
        firstName: sender.firstName,
        lastName: sender.lastName,
      },
      serverUrl: this.environmentService.get('SERVER_URL'),
      locale: 'en' as keyof typeof APP_LOCALES,
    });
    const html = render(emailTemplate);
    const text = render(emailTemplate, {
      plainText: true,
    });

    await this.emailService.send({
      from: `${sender.firstName} ${sender.lastName} (via Twenty) <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
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
          key: this.environmentService.get('APP_SECRET'),
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
    fromUser: User,
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
      fromUser,
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
}
