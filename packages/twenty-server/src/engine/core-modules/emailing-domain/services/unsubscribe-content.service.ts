import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainSendEmailInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { getSoleEnvelopeRecipient } from 'src/engine/core-modules/emailing-domain/utils/get-sole-envelope-recipient.util';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { buildUnsubscribeHeaders } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-headers.util';
import { appendHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/append-html-footer.util';
import { buildUnsubscribeHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-html-footer.util';
import { buildUnsubscribeTextFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-text-footer.util';
import { buildUnsubscribeWebUrl } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-web-url.util';

@Injectable()
export class UnsubscribeContentService {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
  ) {}

  addTo(
    email: EmailingDomainSendEmailInput,
    unsubscribeBaseUrl: string | null,
  ): EmailingDomainSendEmailInput {
    if (!isNonEmptyString(unsubscribeBaseUrl)) {
      return email;
    }

    if (email.sendKind === 'TRANSACTIONAL') {
      return email;
    }

    const soleRecipient = getSoleEnvelopeRecipient(email);

    if (soleRecipient === null) {
      throw new EmailingDomainDriverException(
        'A marketing email must have exactly one envelope recipient so the unsubscribe token identifies who is unsubscribing',
        EmailingDomainDriverExceptionCode.UNSUBSCRIBE_MULTIPLE_RECIPIENTS,
      );
    }

    const token = this.unsubscribeTokenService.sign({
      workspaceId: email.workspaceId,
      emailAddress: soleRecipient,
      ...(isNonEmptyString(email.unsubscribeTopicId)
        ? { unsubscribeTopicId: email.unsubscribeTopicId }
        : {}),
    });

    const webUrl = buildUnsubscribeWebUrl({
      unsubscribeBaseUrl,
      token,
    });

    return {
      ...email,
      text: `${email.text}${buildUnsubscribeTextFooter(webUrl)}`,
      html: isNonEmptyString(email.html)
        ? appendHtmlFooter(email.html, buildUnsubscribeHtmlFooter(webUrl))
        : email.html,
      headers: [
        ...(email.headers ?? []),
        ...buildUnsubscribeHeaders({ webUrl }),
      ],
    };
  }
}
