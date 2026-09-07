import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainSendEmailBatchInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-batch-input.type';
import { type EmailingDomainSendEmailInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { getSoleEnvelopeRecipient } from 'src/engine/core-modules/emailing-domain/utils/get-sole-envelope-recipient.util';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { buildUnsubscribeHeaders } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-headers.util';
import { appendHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/append-html-footer.util';
import { buildUnsubscribeHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-html-footer.util';
import { buildUnsubscribeTextFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-text-footer.util';
import { buildUnsubscribeWebUrl } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-web-url.util';

const UNSUBSCRIBE_URL_REPLACEMENT_TAGS = {
  html: 'v_url_unsubscribe_html',
  text: 'v_url_unsubscribe_text',
};

@Injectable()
export class UnsubscribeContentService {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
  ) {}

  addTo(
    email: EmailingDomainSendEmailInput,
    unsubscribeBaseUrl: string | null,
  ): EmailingDomainSendEmailInput {
    if (email.sendKind === 'TRANSACTIONAL') {
      return email;
    }

    if (!isNonEmptyString(unsubscribeBaseUrl)) {
      throw new EmailingDomainDriverException(
        'A marketing email cannot be sent before the unsubscribe domain is active, because it would ship with no way to unsubscribe',
        EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
      );
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

  addToBatch(
    batch: EmailingDomainSendEmailBatchInput,
    unsubscribeBaseUrl: string | null,
  ): EmailingDomainSendEmailBatchInput {
    if (batch.sendKind === 'TRANSACTIONAL') {
      return batch;
    }

    if (!isNonEmptyString(unsubscribeBaseUrl)) {
      throw new EmailingDomainDriverException(
        'A marketing email cannot be sent before the unsubscribe domain is active, because it would ship with no way to unsubscribe',
        EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
      );
    }

    const htmlUrlTag = `{{${UNSUBSCRIBE_URL_REPLACEMENT_TAGS.html}}}`;
    const textUrlTag = `{{${UNSUBSCRIBE_URL_REPLACEMENT_TAGS.text}}}`;

    return {
      ...batch,
      template: {
        ...batch.template,
        text: `${batch.template.text}${buildUnsubscribeTextFooter(textUrlTag)}`,
        html: isNonEmptyString(batch.template.html)
          ? appendHtmlFooter(
              batch.template.html,
              buildUnsubscribeHtmlFooter(htmlUrlTag),
            )
          : batch.template.html,
      },
      recipients: batch.recipients.map((recipient) => {
        const webUrl = buildUnsubscribeWebUrl({
          unsubscribeBaseUrl,
          token: this.unsubscribeTokenService.sign({
            workspaceId: batch.workspaceId,
            emailAddress: recipient.email,
          }),
        });

        return {
          ...recipient,
          replacements: {
            ...recipient.replacements,
            [UNSUBSCRIBE_URL_REPLACEMENT_TAGS.html]: escapeHtml(webUrl),
            [UNSUBSCRIBE_URL_REPLACEMENT_TAGS.text]: webUrl,
          },
          headers: [
            ...(recipient.headers ?? []),
            ...buildUnsubscribeHeaders({ webUrl }),
          ],
        };
      }),
    };
  }
}
