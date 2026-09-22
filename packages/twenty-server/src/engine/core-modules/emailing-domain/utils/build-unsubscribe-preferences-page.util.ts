import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { type TrackingPreference } from 'src/modules/emailing/types/tracking-preference.type';

type BuildUnsubscribePreferencesPageArgs = {
  token: string;
  topics: TopicOptOutState[];
  trackingPreference: TrackingPreference | undefined;
  updatePath: string;
  unsubscribeAllPath: string;
};

const PAGE_STYLE = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;margin:0;padding:48px 16px;color:#1a1a1a}.card{max-width:420px;margin:0 auto;background:#fff;border:1px solid #ededed;border-radius:16px;padding:40px 32px;text-align:center}h1{font-size:28px;font-weight:700;margin:0 0 8px}.subtitle{color:#888;margin:0 0 28px}.topics{text-align:left;margin:0 0 28px}.topic{display:flex;align-items:center;gap:12px;padding:10px 0;font-size:16px}.topic input{width:18px;height:18px;accent-color:#1a1a1a}.section-title{font-weight:600;margin:0 0 4px}.hint{color:#888;font-size:14px;margin:0 0 8px}button{width:100%;border-radius:10px;padding:14px;font-size:16px;font-weight:600;cursor:pointer;border:1px solid transparent}.primary{background:#1a1a1a;color:#fff}.divider{color:#aaa;margin:16px 0}.secondary{background:#fff;color:#1a1a1a;border:1px solid #ddd}`;

const buildTopicCheckbox = (topic: TopicOptOutState): string => {
  const label = escapeHtml(topic.topicName ?? 'Untitled topic');
  const value = escapeHtml(topic.unsubscribeTopicId);
  const checkedAttribute = topic.optedOut ? '' : ' checked';

  return `<label class="topic"><input type="checkbox" name="unsubscribeTopicId" value="${value}"${checkedAttribute} />${label}</label>`;
};

const buildTopicsSection = (topics: TopicOptOutState[]): string =>
  `<div class="topics">${topics.map(buildTopicCheckbox).join('')}</div>`;

const buildTrackingSection = ({ decision }: TrackingPreference): string => {
  const isDenied = decision === MessageTrackingConsentDecision.DENIED;
  const grantedAttribute = isDenied ? '' : ' checked';
  const deniedAttribute = isDenied ? ' checked' : '';

  return `<div class="topics"><p class="section-title">Email tracking</p><p class="hint">This sender records which links you click in its emails. You can opt out for this email address.</p><label class="topic"><input type="radio" name="tracking" value="${MessageTrackingConsentDecision.GRANTED}"${grantedAttribute} />Keep tracking my clicks</label><label class="topic"><input type="radio" name="tracking" value="${MessageTrackingConsentDecision.DENIED}"${deniedAttribute} />Opt out of click tracking</label></div>`;
};

export const buildUnsubscribePreferencesPage = ({
  token,
  topics,
  trackingPreference,
  updatePath,
  unsubscribeAllPath,
}: BuildUnsubscribePreferencesPageArgs): string => {
  const safeToken = escapeHtml(token);
  const tokenField = `<input type="hidden" name="t" value="${safeToken}" />`;

  const preferenceSections = [
    topics.length > 0 ? buildTopicsSection(topics) : '',
    isDefined(trackingPreference)
      ? buildTrackingSection(trackingPreference)
      : '',
  ].filter(isNonEmptyString);

  // Without anything to pick from, the page collapses to a single
  // confirmation instead of offering an empty preferences form.
  const body =
    preferenceSections.length > 0
      ? `<p class="subtitle">Confirm your preferences:</p><form method="post" action="${updatePath}">${tokenField}${preferenceSections.join(
          '',
        )}<button type="submit" class="primary">Update</button></form><p class="divider">Or</p><form method="post" action="${unsubscribeAllPath}">${tokenField}<button type="submit" class="secondary">Unsubscribe all</button></form>`
      : `<p class="subtitle">You will stop receiving these emails.</p><form method="post" action="${unsubscribeAllPath}">${tokenField}<button type="submit" class="primary">Unsubscribe</button></form>`;

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Email preferences</title><style>${PAGE_STYLE}</style></head><body><div class="card"><h1>Do you want to unsubscribe?</h1>${body}</div></body></html>`;
};
