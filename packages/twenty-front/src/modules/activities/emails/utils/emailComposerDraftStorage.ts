import { isDefined } from 'twenty-shared/utils';

import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';

const EMAIL_COMPOSER_DRAFT_STORAGE_PREFIX = 'email-composer-draft:';

export type PersistedEmailComposerDraft = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  showCcBcc: boolean;
};

type BuildEmailComposerDraftStorageKeyArgs = {
  connectedAccountId: string;
  defaultInReplyTo?: string;
  contextRecord?: EmailComposerContextRecord | null;
};

export const buildEmailComposerDraftStorageKey = ({
  connectedAccountId,
  defaultInReplyTo,
  contextRecord,
}: BuildEmailComposerDraftStorageKeyArgs): string | null => {
  if (!connectedAccountId) {
    return null;
  }

  if (isDefined(defaultInReplyTo) && defaultInReplyTo.trim().length > 0) {
    return `${EMAIL_COMPOSER_DRAFT_STORAGE_PREFIX}reply:${connectedAccountId}:${defaultInReplyTo}`;
  }

  if (isDefined(contextRecord)) {
    return `${EMAIL_COMPOSER_DRAFT_STORAGE_PREFIX}record:${connectedAccountId}:${contextRecord.objectNameSingular}:${contextRecord.recordId}`;
  }

  return null;
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
};

export const loadEmailComposerDraft = (
  storageKey: string | null,
): PersistedEmailComposerDraft | null => {
  const storage = getLocalStorage();

  if (!isDefined(storageKey) || !isDefined(storage)) {
    return null;
  }

  try {
    const rawValue = storage.getItem(storageKey);

    if (!isDefined(rawValue)) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<PersistedEmailComposerDraft>;

    if (
      typeof parsed?.to !== 'string' ||
      typeof parsed?.cc !== 'string' ||
      typeof parsed?.bcc !== 'string' ||
      typeof parsed?.subject !== 'string' ||
      typeof parsed?.body !== 'string'
    ) {
      return null;
    }

    return {
      to: parsed.to,
      cc: parsed.cc,
      bcc: parsed.bcc,
      subject: parsed.subject,
      body: parsed.body,
      showCcBcc: Boolean(parsed.showCcBcc),
    };
  } catch {
    return null;
  }
};

export const saveEmailComposerDraft = (
  storageKey: string | null,
  draft: PersistedEmailComposerDraft,
): void => {
  const storage = getLocalStorage();

  if (!isDefined(storageKey) || !isDefined(storage)) {
    return;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // Ignore storage quota and security errors when persisting drafts.
  }
};

export const clearEmailComposerDraft = (storageKey: string | null): void => {
  const storage = getLocalStorage();

  if (!isDefined(storageKey) || !isDefined(storage)) {
    return;
  }

  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage security errors when clearing drafts.
  }
};
