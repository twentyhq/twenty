export const buildUnsubscribeHtmlFooter = (httpsUrl: string): string =>
  `<hr style="margin-top:24px;border:none;border-top:1px solid #eee" /><p style="font-size:12px;color:#888">Don't want these emails? <a href="${httpsUrl}">Unsubscribe</a>.</p>`;
