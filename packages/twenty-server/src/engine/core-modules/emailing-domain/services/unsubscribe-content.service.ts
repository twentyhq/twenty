import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { UNSUBSCRIBE_URL_VARIABLE_NAME } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-url-variable-name.constant';
import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';
import { type EmailingDomainSendBulkEmailRequest } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-bulk-email.type';
import { type EmailingDomainSendEmailInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { buildUnsubscribeHeaders } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-headers.util';
import { buildUnsubscribeHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-html-footer.util';
import { buildUnsubscribeTextFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-text-footer.util';
import { buildUnsubscribeUrls } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-urls.util';

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

    const token = this.unsubscribeTokenService.sign({
      workspaceId: email.workspaceId,
      emailAddress: email.to[0],
      ...(isNonEmptyString(email.unsubscribeTopicId)
        ? { unsubscribeTopicId: email.unsubscribeTopicId }
        : {}),
    });

    const unsubscribeUrls = buildUnsubscribeUrls({
      unsubscribeBaseUrl,
      domain: email.domain,
      token,
    });

    return {
      ...email,
      text: `${email.text}${buildUnsubscribeTextFooter(unsubscribeUrls.webUrl)}`,
      html: isNonEmptyString(email.html)
        ? `${email.html}${buildUnsubscribeHtmlFooter(unsubscribeUrls.webUrl)}`
        : email.html,
      headers: [
        ...(email.headers ?? []),
        ...buildUnsubscribeHeaders(unsubscribeUrls),
      ],
    };
  }

  addToBulk(
    request: EmailingDomainSendBulkEmailRequest,
    unsubscribeBaseUrl: string | null,
  ): {
    htmlTemplate: string;
    textTemplate: string;
    headersByRecipient: Map<string, EmailingDomainHeader[]>;
    variablesByRecipient: Map<string, Record<string, string>>;
  } {
    if (!isNonEmptyString(unsubscribeBaseUrl)) {
      return {
        htmlTemplate: request.htmlTemplate,
        textTemplate: request.textTemplate,
        headersByRecipient: new Map(),
        variablesByRecipient: new Map(),
      };
    }

    const headersByRecipient = new Map<string, EmailingDomainHeader[]>();
    const variablesByRecipient = new Map<string, Record<string, string>>();

    for (const recipient of request.recipients) {
      const token = this.unsubscribeTokenService.sign({
        workspaceId: request.workspaceId,
        emailAddress: recipient.to,
        ...(isNonEmptyString(request.unsubscribeTopicId)
          ? { unsubscribeTopicId: request.unsubscribeTopicId }
          : {}),
      });

      const unsubscribeUrls = buildUnsubscribeUrls({
        unsubscribeBaseUrl,
        domain: request.domain,
        token,
      });

      headersByRecipient.set(
        recipient.to,
        buildUnsubscribeHeaders(unsubscribeUrls),
      );
      variablesByRecipient.set(recipient.to, {
        [UNSUBSCRIBE_URL_VARIABLE_NAME]: unsubscribeUrls.webUrl,
      });
    }

    const unsubscribeUrlPlaceholder = `{{${UNSUBSCRIBE_URL_VARIABLE_NAME}}}`;

    return {
      htmlTemplate: `${request.htmlTemplate}${buildUnsubscribeHtmlFooter(unsubscribeUrlPlaceholder)}`,
      textTemplate: `${request.textTemplate}${buildUnsubscribeTextFooter(unsubscribeUrlPlaceholder)}`,
      headersByRecipient,
      variablesByRecipient,
    };
  }
}
