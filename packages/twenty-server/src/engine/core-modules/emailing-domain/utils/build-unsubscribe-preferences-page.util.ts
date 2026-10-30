import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { type UnsubscribePageSender } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-sender.type';
import { type UnsubscribePageTracking } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-tracking.type';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

type BuildUnsubscribePreferencesPageArgs = {
  token: string;
  sender: UnsubscribePageSender;
  emailAddress: string;
  topics: TopicOptOutState[];
  tracking: UnsubscribePageTracking | undefined;
  updatePath: string;
  unsubscribeAllPath: string;
};

const PAGE_STYLE = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;margin:0;padding:48px 16px;color:#1a1a1a}.card{max-width:420px;margin:0 auto;background:#fff;border:1px solid #ededed;border-radius:16px;padding:40px 32px;text-align:left}.sender{display:flex;align-items:center;gap:8px;margin:0 0 16px;font-weight:600}.logo{width:24px;height:24px;border-radius:4px;object-fit:cover}h1{font-size:28px;font-weight:700;margin:0 0 8px}.subtitle{color:#888;margin:0 0 28px}.topics{text-align:left;margin:0 0 28px}.topic{display:flex;align-items:center;gap:12px;padding:10px 0;font-size:16px}.topic input{width:18px;height:18px;accent-color:color(display-p3 0.276 0.384 0.837)}.section-title{font-weight:600;margin:0 0 4px}.hint{color:#888;font-size:14px;margin:0 0 8px}button{width:100%;border-radius:10px;padding:14px;font-size:16px;font-weight:600;cursor:pointer;border:1px solid transparent}.primary{background:#1a1a1a;color:#fff}.divider{color:#aaa;margin:16px 0;text-align:center}.secondary{background:#fff;color:#1a1a1a;border:1px solid #ddd}`;

const buildSenderHeader = ({
  name,
  logoUrl,
}: UnsubscribePageSender): string => {
  if (!isNonEmptyString(name) && !isNonEmptyString(logoUrl)) {
    return '';
  }

  const logo = isNonEmptyString(logoUrl)
    ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="" />`
    : '';
  const label = isNonEmptyString(name)
    ? `<span>${escapeHtml(name)}</span>`
    : '';

  return `<div class="sender">${logo}${label}</div>`;
};

const buildTopicCheckbox = (topic: TopicOptOutState): string => {
  const label = escapeHtml(topic.topicName ?? 'Untitled topic');
  const value = escapeHtml(topic.unsubscribeTopicId);
  const checkedAttribute = topic.optedOut ? '' : ' checked';

  return `<label class="topic"><input type="checkbox" name="unsubscribeTopicId" value="${value}"${checkedAttribute} />${label}</label>`;
};

const buildTopicsSection = (topics: TopicOptOutState[]): string =>
  `<div class="topics">${topics.map(buildTopicCheckbox).join('')}</div>`;

const getTrackingCopy = ({
  isOpenTrackingEnabled,
  isClickTrackingEnabled,
}: UnsubscribePageTracking): {
  trackedActivityPhrase: string;
  keepLabel: string;
} => {
  if (isOpenTrackingEnabled && isClickTrackingEnabled) {
    return {
      trackedActivityPhrase:
        'when you open its emails and which links you click',
      keepLabel: 'Keep tracking my opens and clicks',
    };
  }

  if (isOpenTrackingEnabled) {
    return {
      trackedActivityPhrase: 'when you open its emails',
      keepLabel: 'Keep tracking my opens',
    };
  }

  return {
    trackedActivityPhrase: 'which links you click in its emails',
    keepLabel: 'Keep tracking my clicks',
  };
};

const buildTrackingSection = ({
  tracking,
  senderName,
}: {
  tracking: UnsubscribePageTracking;
  senderName: string | null;
}): string => {
  const { trackedActivityPhrase, keepLabel } = getTrackingCopy(tracking);
  const senderLabel = isNonEmptyString(senderName)
    ? escapeHtml(senderName)
    : 'This sender';
  const trackedAttribute = tracking.isOptedOut ? '' : ' checked';
  const optedOutAttribute = tracking.isOptedOut ? ' checked' : '';

  return `<div class="topics"><p class="section-title">Email tracking</p><p class="hint">${senderLabel} may record ${trackedActivityPhrase}. You can opt out for this email address.</p><label class="topic"><input type="radio" name="tracking" value="TRACKED"${trackedAttribute} />${keepLabel}</label><label class="topic"><input type="radio" name="tracking" value="OPTED_OUT"${optedOutAttribute} />Opt out of tracking</label></div>`;
};

export const buildUnsubscribePreferencesPage = ({
  token,
  sender,
  emailAddress,
  topics,
  tracking,
  updatePath,
  unsubscribeAllPath,
}: BuildUnsubscribePreferencesPageArgs): string => {
  const safeToken = escapeHtml(token);
  const safeEmailAddress = escapeHtml(emailAddress);
  const tokenField = `<input type="hidden" name="t" value="${safeToken}" />`;

  const preferenceSections = [
    topics.length > 0 ? buildTopicsSection(topics) : '',
    isDefined(tracking)
      ? buildTrackingSection({ tracking, senderName: sender.name })
      : '',
  ].filter(isNonEmptyString);

  const preferencesSubtitle =
    topics.length > 0
      ? `Uncheck the emails you no longer want at ${safeEmailAddress}.`
      : `Email preferences for ${safeEmailAddress}`;

  // Without anything to pick from, the page collapses to a single
  // confirmation instead of offering an empty preferences form.
  const body =
    preferenceSections.length > 0
      ? `<p class="subtitle">${preferencesSubtitle}</p><form method="post" action="${updatePath}">${tokenField}${preferenceSections.join(
          '',
        )}<button type="submit" class="primary">Update</button></form><p class="divider">Or</p><form method="post" action="${unsubscribeAllPath}">${tokenField}<button type="submit" class="secondary">Unsubscribe all</button></form>`
      : `<p class="subtitle">You will stop receiving these emails at ${safeEmailAddress}.</p><form method="post" action="${unsubscribeAllPath}">${tokenField}<button type="submit" class="primary">Unsubscribe</button></form>`;

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Email preferences</title><style>${PAGE_STYLE}</style></head><body><div class="card">${buildSenderHeader(sender)}<h1>Do you want to unsubscribe?</h1>${body}</div></body></html>`;
};
