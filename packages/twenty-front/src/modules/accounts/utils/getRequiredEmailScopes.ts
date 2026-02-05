import { GMAIL_COMPOSE_SCOPE } from '@/accounts/constants/GmailComposeScope';
import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

type EmailActionType = 'SEND_EMAIL' | 'DRAFT_EMAIL';

type EmailScopeRequirement = {
  hasRequiredScopes: boolean;
  extraScopes: string[];
};

const GOOGLE_SCOPES_BY_ACTION: Record<EmailActionType, string> = {
  SEND_EMAIL: GMAIL_SEND_SCOPE,
  DRAFT_EMAIL: GMAIL_COMPOSE_SCOPE,
};

const MICROSOFT_SCOPES_BY_ACTION: Record<EmailActionType, string> = {
  SEND_EMAIL: MICROSOFT_SEND_SCOPE,
  DRAFT_EMAIL: MICROSOFT_SEND_SCOPE,
};

export const getRequiredEmailScopes = (
  connectedAccount: ConnectedAccount,
  actionType: EmailActionType,
): EmailScopeRequirement => {
  const scopes = connectedAccount.scopes;

  switch (connectedAccount.provider) {
    case ConnectedAccountProvider.GOOGLE: {
      const requiredScope = GOOGLE_SCOPES_BY_ACTION[actionType];
      const hasRequiredScopes =
        isDefined(scopes) && scopes.some((scope) => scope === requiredScope);

      return {
        hasRequiredScopes,
        extraScopes: hasRequiredScopes ? [] : [requiredScope],
      };
    }
    case ConnectedAccountProvider.MICROSOFT: {
      const requiredScope = MICROSOFT_SCOPES_BY_ACTION[actionType];
      const hasRequiredScopes =
        isDefined(scopes) && scopes.some((scope) => scope === requiredScope);

      return {
        hasRequiredScopes,
        extraScopes: hasRequiredScopes ? [] : [requiredScope],
      };
    }
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return {
        hasRequiredScopes: isDefined(
          connectedAccount.connectionParameters?.SMTP,
        ),
        extraScopes: [],
      };
    default:
      assertUnreachable(
        connectedAccount.provider,
        'Provider not yet supported for email actions',
      );
  }
};
