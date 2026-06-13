import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

type BuildUnsubscribePreferencesPageArgs = {
  token: string;
  topics: TopicOptOutState[];
  updatePath: string;
  unsubscribeAllPath: string;
};

const PAGE_STYLE = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;margin:0;padding:48px 16px;color:#1a1a1a}.card{max-width:420px;margin:0 auto;background:#fff;border:1px solid #ededed;border-radius:16px;padding:40px 32px;text-align:center}h1{font-size:28px;font-weight:700;margin:0 0 8px}.subtitle{color:#888;margin:0 0 28px}.topics{text-align:left;margin:0 0 28px}.topic{display:flex;align-items:center;gap:12px;padding:10px 0;font-size:16px}.topic input{width:18px;height:18px;accent-color:#1a1a1a}button{width:100%;border-radius:10px;padding:14px;font-size:16px;font-weight:600;cursor:pointer;border:1px solid transparent}.primary{background:#1a1a1a;color:#fff}.divider{color:#aaa;margin:16px 0}.secondary{background:#fff;color:#1a1a1a;border:1px solid #ddd}`;

const buildTopicCheckbox = (topic: TopicOptOutState): string => {
  const label = escapeHtml(topic.topicName ?? 'Untitled topic');
  const value = escapeHtml(topic.unsubscribeTopicId);
  // Checked = still receiving (no per-topic opt-out for this address).
  const checkedAttribute = topic.optedOut ? '' : ' checked';

  return `<label class="topic"><input type="checkbox" name="unsubscribeTopicId" value="${value}"${checkedAttribute} />${label}</label>`;
};

export const buildUnsubscribePreferencesPage = ({
  token,
  topics,
  updatePath,
  unsubscribeAllPath,
}: BuildUnsubscribePreferencesPageArgs): string => {
  const safeToken = escapeHtml(token);

  const updateSection =
    topics.length > 0
      ? `<form method="post" action="${updatePath}"><input type="hidden" name="t" value="${safeToken}" /><div class="topics">${topics
          .map(buildTopicCheckbox)
          .join(
            '',
          )}</div><button type="submit" class="primary">Update</button></form><p class="divider">Or</p>`
      : '';

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Email preferences</title><style>${PAGE_STYLE}</style></head><body><div class="card"><h1>Do you want to unsubscribe?</h1><p class="subtitle">Confirm your preferences:</p>${updateSection}<form method="post" action="${unsubscribeAllPath}"><input type="hidden" name="t" value="${safeToken}" /><button type="submit" class="secondary">Unsubscribe All</button></form></div></body></html>`;
};
