import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { render } from '@react-email/components';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { SendEmailVerificationLinkEmail } from 'twenty-emails';
import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { castAppTokenToEmailVerification } from 'src/engine/core-modules/email-verification/utils/cast-app-token-to-email-verification.util';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class EmailVerificationService {
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly domainManagerService: DomainManagerService,
    private readonly emailService: EmailService,
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async generateEmailVerificationToken(userId: string, email: string) {
    const expiresIn = this.environmentService.get(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
    );
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const verificationToken = this.appTokenRepository.create({
      userId,
      expiresAt,
      type: AppTokenType.EmailVerificationToken,
      value: crypto.randomBytes(32).toString('hex'),
      context: { email },
    });

    return this.appTokenRepository.save(verificationToken);
  }

  async verifyEmailVerificationToken(token: string) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        id: token,
        type: AppTokenType.EmailVerificationToken,
      },
      relations: ['user'],
    });

    if (!appToken || new Date() > appToken.expiresAt) {
      throw new EmailVerificationException(
        'Invalid or expired token',
        EmailVerificationExceptionCode.INVALID_TOKEN,
      );
    }

    const emailVerificationToken = castAppTokenToEmailVerification(appToken);

    const user = await this.userService.markEmailAsVerified(
      emailVerificationToken.userId,
    );

    await this.appTokenRepository.remove(appToken);

    return {
      success: true,
      email: user.email,
    };
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    workspaceSubdomain?: string,
  ) {
    if (!this.environmentService.get('IS_EMAIL_VERIFICATION_REQUIRED')) {
      throw new EmailVerificationException(
        'Email verification token cannot be sent because email verification is not required',
        EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED,
      );
    }

    const { id: emailVerificationToken } =
      await this.generateEmailVerificationToken(userId, email);

    const verificationLink =
      this.domainManagerService.buildEmailVerificationURL({
        emailVerificationToken,
        email,
        workspaceSubdomain,
      });

    const emailData = {
      link: verificationLink.toString(),
    };

    const emailTemplate = SendEmailVerificationLinkEmail(emailData);

    const html = render(emailTemplate, {
      pretty: true,
    });

    const text = render(emailTemplate, {
      plainText: true,
    });

    await this.emailService.send({
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'Welcome to Twenty: Please Confirm Your Email',
      text,
      html,
    });

    return { success: true };
  }

  async resendEmailVerificationToken(email: string) {
    if (!this.environmentService.get('IS_EMAIL_VERIFICATION_REQUIRED')) {
      throw new EmailVerificationException(
        'Email verification token cannot be sent because email verification is not required',
        EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED,
      );
    }

    const user = await this.userService.getUserByEmail(email);

    if (user.emailVerified) {
      throw new EmailVerificationException(
        'Email already verified',
        EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED,
      );
    }

    const appTokens = await this.appTokenRepository.find({
      where: {
        userId: user.id,
        type: AppTokenType.EmailVerificationToken,
      },
    });

    await Promise.all(
      appTokens.map((emailVerificationToken) =>
        this.appTokenRepository.delete(emailVerificationToken.id),
      ),
    );

    const workspaces =
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(email);

    const workspaceSubdomain =
      workspaces.length > 0 ? workspaces[0].subdomain : undefined;

    await this.sendVerificationEmail(user.id, email, workspaceSubdomain);

    return { success: true };
  }
}
