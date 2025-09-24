import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import ms from 'ms';
import { SendEmailVerificationLinkEmail } from 'twenty-emails';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailVerificationTokenService } from 'src/engine/core-modules/auth/token/services/email-verification-token.service';
import { type WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType } from 'src/engine/core-modules/domain-manager/domain-manager.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(AppToken)
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly domainManagerService: DomainManagerService,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userService: UserService,
    private readonly emailVerificationTokenService: EmailVerificationTokenService,
    private readonly i18nService: I18nService,
  ) {}

  async sendVerificationEmail(
    userId: string,
    email: string,
    workspace:
      | WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType
      | undefined,
    locale: keyof typeof APP_LOCALES,
    verifyEmailRedirectPath?: string,
  ) {
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
      ? this.domainManagerService.buildWorkspaceURL({
          workspace,
          ...linkPathnameAndSearchParams,
        })
      : this.domainManagerService.buildBaseUrl(linkPathnameAndSearchParams);

    const emailData = {
      link: verificationLink.toString(),
      locale,
    };

    const emailTemplate = SendEmailVerificationLinkEmail(emailData);

    const html = await render(emailTemplate);
    const text = await render(emailTemplate, {
      plainText: true,
    });

    const emailVerificationMsg = msg`Welcome to Twenty: Please Confirm Your Email`;
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
    workspace:
      | WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType
      | undefined,
    locale: keyof typeof APP_LOCALES,
  ) {
    if (!this.twentyConfigService.get('IS_EMAIL_VERIFICATION_REQUIRED')) {
      throw new EmailVerificationException(
        'Email verification token cannot be sent because email verification is not required',
        EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED,
      );
    }

    const user = await this.userService.getUserByEmail(email);

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

    await this.sendVerificationEmail(user.id, email, workspace, locale);

    return { success: true };
  }
}
