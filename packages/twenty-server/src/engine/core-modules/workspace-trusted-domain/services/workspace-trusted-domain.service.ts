import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { render } from '@react-email/render';
import { Repository } from 'typeorm';
import { APP_LOCALES } from 'twenty-shared';
import { SendTrustDomainValidation } from 'twenty-emails';

import { WorkspaceTrustedDomain as WorkspaceTrustedDomainEntity } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.entity';
import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/dtos/trusted-domain.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { workspaceTrustedDomainValidator } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.validate';
import {
  WorkspaceTrustedDomainException,
  WorkspaceTrustedDomainExceptionCode,
} from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.exception';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceTrustedDomainService {
  constructor(
    @InjectRepository(WorkspaceTrustedDomain, 'core')
    private readonly workspaceTrustedDomainRepository: Repository<WorkspaceTrustedDomainEntity>,
    private readonly emailService: EmailService,
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  async sendTrustedDomainValidationEmail(
    sender: User,
    to: string,
    workspace: Workspace,
    workspaceTrustedDomain: WorkspaceTrustedDomainEntity,
  ) {
    if (workspaceTrustedDomain.isValidated) {
      throw new WorkspaceTrustedDomainException(
        'Trusted domain has already been validated',
        WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_ALREADY_VERIFIED,
      );
    }

    if (to.split('@')[1] !== workspaceTrustedDomain.domain) {
      throw new WorkspaceTrustedDomainException(
        'Trusted domain does not match email domain',
        WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL,
      );
    }

    const link = this.domainManagerService.buildWorkspaceURL({
      workspace,
      pathname: `settings/security`,
      searchParams: {
        wtdId: workspaceTrustedDomain.id,
        validationToken: this.generateUniqueHash(workspaceTrustedDomain),
      },
    });

    const emailTemplate = SendTrustDomainValidation({
      link: link.toString(),
      workspace: { name: workspace.displayName, logo: workspace.logo },
      domain: workspaceTrustedDomain.domain,
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
      subject: 'Activate Your Trusted Domain',
      text,
      html,
    });
  }

  private generateUniqueHash(
    workspaceTrustedDomain: WorkspaceTrustedDomainEntity,
  ) {
    return crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          id: workspaceTrustedDomain.id,
          domain: workspaceTrustedDomain.domain,
          key: this.environmentService.get('APP_SECRET'),
        }),
      )
      .digest('hex');
  }

  async validateTrustedDomain({
    validationToken,
    workspaceTrustedDomainId,
  }: {
    validationToken: string;
    workspaceTrustedDomainId: string;
  }) {
    const workspaceTrustedDomain =
      await this.workspaceTrustedDomainRepository.findOneBy({
        id: workspaceTrustedDomainId,
      });

    workspaceTrustedDomainValidator.assertIsDefinedOrThrow(
      workspaceTrustedDomain,
    );

    if (workspaceTrustedDomain.isValidated) {
      throw new WorkspaceTrustedDomainException(
        'Trusted domain has already been validated',
        WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_ALREADY_VALIDATED,
      );
    }

    const isHashValid =
      this.generateUniqueHash(workspaceTrustedDomain) === validationToken;

    if (!isHashValid) {
      throw new WorkspaceTrustedDomainException(
        'Invalid trusted domain validation token',
        WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_VALIDATION_TOKEN_INVALID,
      );
    }

    return await this.workspaceTrustedDomainRepository.save({
      ...workspaceTrustedDomain,
      isValidated: true,
    });
  }

  async createTrustedDomain(
    domain: string,
    inWorkspace: Workspace,
    fromUser: User,
    emailToValidateDomain: string,
  ): Promise<WorkspaceTrustedDomain> {
    const workspaceTrustedDomain =
      await this.workspaceTrustedDomainRepository.save({
        workspaceId: inWorkspace.id,
        domain,
      });

    await this.sendTrustedDomainValidationEmail(
      fromUser,
      emailToValidateDomain,
      inWorkspace,
      workspaceTrustedDomain,
    );

    return workspaceTrustedDomain;
  }

  async deleteTrustedDomain(workspace: Workspace, trustedDomainId: string) {
    const trustedDomain = await this.workspaceTrustedDomainRepository.findOneBy(
      {
        id: trustedDomainId,
        workspaceId: workspace.id,
      },
    );

    workspaceTrustedDomainValidator.assertIsDefinedOrThrow(trustedDomain);

    await this.workspaceTrustedDomainRepository.delete(trustedDomain);
  }

  async getAllTrustedDomainsByWorkspace(workspace: Workspace) {
    return await this.workspaceTrustedDomainRepository.find({
      where: {
        workspaceId: workspace.id,
      },
    });
  }
}
