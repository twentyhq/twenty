import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import ms from 'ms';
import { SendEmailVerificationLinkEmail } from 'twenty-emails';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailVerificationTokenService } from 'src/engine/core-modules/auth/token/services/email-verification-token.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { WorkspaceDomainConfig } from 'src/engine/core-modules/domain/workspace-domains/types/workspace-domain-config.type';
import { EmailVerificationTrigger } from 'src/engine/core-modules/email-verification/email-verification.constants';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly domainsServerConfigService: DomainServerConfigService,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly emailVerificationTokenService: EmailVerificationTokenService,
    private readonly i18nService: I18nService,
  ) {}

  async sendVerificationEmail({
    userId,
    email,
    workspace,
    locale,
    verifyEmailRedirectPath,
    verificationTrigger = EmailVerificationTrigger.SIGN_UP,
  }: {
    userId: string;
    email: string;
    workspace: WorkspaceDomainConfig | undefined;
    locale: keyof typeof APP_LOCALES;
    verifyEmailRedirectPath?: string;
    verificationTrigger?: EmailVerificationTrigger;
  }) {
    if (!this.twentyConfigService.get('IS_EMAIL_VERIFICATION_REQUIRED')) {
      return { success: false };
    }

    const { token: emailVerificationToken } =
      await this.emailVerificationTokenService.generateToken(userId, email);

    const linkPathnameAndSearchParams = {
      pathname: AppPath.VerifyEmail,
      searchParams: {
        emailVerificationToken,
        email,
        ...(isDefined(verifyEmailRedirectPath)
          ? { nextPath: verifyEmailRedirectPath }
          : {}),
      },
    };
    const verificationLink = workspace
      ? this.workspaceDomainsService.buildWorkspaceURL({
          workspace,
          ...linkPathnameAndSearchParams,
        })
      : this.domainsServerConfigService.buildBaseUrl(
          linkPathnameAndSearchParams,
        );

    const emailData = {
      link: verificationLink.toString(),
      locale,
      isEmailUpdate:
        verificationTrigger === EmailVerificationTrigger.EMAIL_UPDATE,
    };

    const emailTemplate = SendEmailVerificationLinkEmail(emailData);

    const html = await render(emailTemplate);
    const text = await render(emailTemplate, {
      plainText: true,
    });

    const emailVerificationMsg =
      verificationTrigger === EmailVerificationTrigger.EMAIL_UPDATE
        ? msg`Please confirm your updated email`
        : msg`Welcome to Twenty: Please Confirm Your Email`;
    const i18n = this.i18nService.getI18nInstance(locale);
    const subject = i18n._(emailVerificationMsg);

    await this.emailService.send({
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      to: email,
      subject,
      text,
      html,
    });

    return { success: true };
  }

  async resendEmailVerificationToken(
    email: string,
    workspace: WorkspaceDomainConfig | undefined,
    locale: keyof typeof APP_LOCALES,
  ) {
    if (!this.twentyConfigService.get('IS_EMAIL_VERIFICATION_REQUIRED')) {
      throw new EmailVerificationException(
        'Email verification token cannot be sent because email verification is not required',
        EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED,
      );
    }

    // TODO: Remove the dependency on querying user altogether when the endpoint is authenticated.
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    assertIsDefinedOrThrow(user);

    if (user.isEmailVerified) {
      throw new EmailVerificationException(
        'Email already verified',
        EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED,
      );
    }

    const existingToken = await this.appTokenRepository.findOne({
      where: {
        userId: user.id,
        type: AppTokenType.EmailVerificationToken,
      },
    });

    if (existingToken) {
      const cooldownDuration = ms('1m');
      const timeToWaitMs = differenceInMilliseconds(
        addMilliseconds(existingToken.createdAt, cooldownDuration),
        new Date(),
      );

      if (timeToWaitMs > 0) {
        throw new EmailVerificationException(
          `Please wait ${ms(timeToWaitMs, { long: true })} before requesting another verification email`,
          EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED,
        );
      }

      await this.appTokenRepository.delete(existingToken.id);
    }

    await this.sendVerificationEmail({
      userId: user.id,
      email,
      workspace,
      locale,
      verificationTrigger: EmailVerificationTrigger.SIGN_UP,
    });

    return { success: true };
  }
}
