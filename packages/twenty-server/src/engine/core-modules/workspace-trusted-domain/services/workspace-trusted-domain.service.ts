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
import { isWorkDomain } from 'src/utils/is-work-email';
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

  private checkIsVerified(
    domain: string,
    inWorkspace: Workspace,
    fromUser: User,
  ) {
    if (!isWorkDomain(domain)) return false;

    if (
      domain === inWorkspace.customDomain &&
      inWorkspace.isCustomDomainEnabled
    )
      return true;

    if (fromUser.email.endsWith(domain) && fromUser.isEmailVerified)
      return true;

    return false;
  }

  async sendTrustedDomainValidationEmail(
    sender: User,
    to: string,
    workspace: Workspace,
    trustedDomainId: string,
  ) {
    const trustedDomain = await this.workspaceTrustedDomainRepository.findOneBy(
      {
        id: trustedDomainId,
      },
    );

    workspaceTrustedDomainValidator.assertIsDefinedOrThrow(trustedDomain);

    if (trustedDomain.isValidated) {
      throw new WorkspaceTrustedDomainException(
        'Trusted domain has already been validated',
        WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_ALREADY_VERIFIED,
      );
    }

    if (!to.endsWith(trustedDomain.domain)) {
      throw new WorkspaceTrustedDomainException(
        'Trusted domain does not match validator email',
        WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_DOES_NOT_MATCH_VALIDATOR_EMAIL,
      );
    }

    const link = this.domainManagerService.buildWorkspaceURL({
      workspace,
      pathname: `settings/security`,
      searchParams: {
        validationToken: trustedDomain.validationToken,
      },
    });

    const emailTemplate = SendTrustDomainValidation({
      link: link.toString(),
      workspace: { name: workspace.displayName, logo: workspace.logo },
      domain: trustedDomain.domain,
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

  async createTrustedDomain(
    domain: string,
    inWorkspace: Workspace,
    fromUser: User,
  ): Promise<WorkspaceTrustedDomain> {
    return await this.workspaceTrustedDomainRepository.save({
      workspaceId: inWorkspace.id,
      domain,
      isVerified: this.checkIsVerified(domain, inWorkspace, fromUser),
      validationToken: crypto.randomBytes(32).toString('hex'),
    });
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
