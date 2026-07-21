import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

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
}
