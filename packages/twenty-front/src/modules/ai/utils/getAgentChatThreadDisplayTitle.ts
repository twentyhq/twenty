import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

export const getAgentChatThreadDisplayTitle = (
  title: string | null | undefined,
) => (isNonEmptyString(title) ? title : t`New chat`);
