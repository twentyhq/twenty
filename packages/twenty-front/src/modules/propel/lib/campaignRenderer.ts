// Fork-local PORT of the Propel campaign renderer (propel-crm-integration:
// src/shared/campaign-renderer.ts). Pure, dependency-free, no I/O — the exact
// merge-field + light-markdown → branded-email logic the server drain uses,
// copied so the graduated builder's LIVE preview renders the REAL branded email
// (not the sandbox's div/span approximation). We do NOT import across repos;
// keep this byte-faithful to the source so the preview matches what sends.
//
// Only the subset the builder preview needs is ported: MERGE_FIELDS_V1,
// parseTemplate, renderParsed, escapeHtml, markdownToEmailHtml, renderEmail.

export const MERGE_FIELDS_V1 = [
  'firstName',
  'lastName',
  'listingTitle',
  'listingPrice',
  'permitNumber',
  'agentName',
  'agentPhone',
  'unsubscribeUrl',
] as const;

export type MergeField = (typeof MERGE_FIELDS_V1)[number];
export type MergeValues = Partial<Record<MergeField, string>>;

const FIELD_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export interface ParsedTemplate {
  /** literal segments; segments.length === fields.length + 1 */
  segments: string[];
  fields: string[];
}

export const parseTemplate = (template: string): ParsedTemplate => {
  const segments: string[] = [];
  const fields: string[] = [];
  let last = 0;
  for (const m of template.matchAll(FIELD_RE)) {
    segments.push(template.slice(last, m.index));
    fields.push(m[1]);
    last = (m.index ?? 0) + m[0].length;
  }
  segments.push(template.slice(last));
  return { segments, fields };
};

/** Send-start gate: returns the list of unknown fields ([] = template valid). */
export const validateTemplate = (
  template: string,
  extraAllowed: readonly string[] = [],
): string[] => {
  const known = new Set<string>([...MERGE_FIELDS_V1, ...extraAllowed]);
  return [
    ...new Set(parseTemplate(template).fields.filter((f) => !known.has(f))),
  ];
};

export const escapeHtml = (s: string): string =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const renderParsed = (
  parsed: ParsedTemplate,
  values: MergeValues,
  opts: { escape: boolean },
): string => {
  let out = '';
  for (let i = 0; i < parsed.segments.length; i += 1) {
    out += parsed.segments[i];
    if (i < parsed.fields.length) {
      const raw = values[parsed.fields[i] as MergeField] ?? '';
      out += opts.escape ? escapeHtml(raw) : raw;
    }
  }
  return out;
};

// ── Light Markdown → email-safe HTML (no dependency) ──────────────────────────
const EMAIL_BRAND = {
  red: '#d6122c',
  ink: '#1f2937',
  body: '#2b2b2b',
  muted: '#8a8f98',
  line: '#e6e7eb',
  pageBg: '#f4f4f5',
  quoteBg: '#f7f7f8',
};

const SAFE_URL_RE = /^(https?:\/\/|mailto:)/i;

const formatEmphasis = (s: string): string => {
  let r = s;
  r = r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  r = r.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  r = r.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  r = r.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
  r = r.replace(
    /`([^`]+)`/g,
    `<code style="font-family:Menlo,Consolas,monospace;font-size:13px;background:${EMAIL_BRAND.quoteBg};padding:1px 5px;border-radius:4px;">$1</code>`,
  );
  return r;
};

const htmlUnescape = (s: string): string =>
  s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');

type UrlResolver = (escapedUrl: string) => string;
const toRawUrl = (escapedUrl: string, resolveUrl?: UrlResolver): string =>
  resolveUrl ? resolveUrl(escapedUrl) : htmlUnescape(escapedUrl);

const formatInline = (escaped: string, resolveUrl?: UrlResolver): string => {
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null = re.exec(escaped);
  while (m !== null) {
    out += formatEmphasis(escaped.slice(last, m.index));
    const text = m[1];
    const rawUrl = toRawUrl(m[2], resolveUrl);
    out += SAFE_URL_RE.test(rawUrl)
      ? `<a href="${escapeHtml(rawUrl)}" style="color:${EMAIL_BRAND.red};text-decoration:underline;">${formatEmphasis(text)}</a>`
      : `${formatEmphasis(text)} (${escapeHtml(rawUrl)})`;
    last = m.index + m[0].length;
    m = re.exec(escaped);
  }
  out += formatEmphasis(escaped.slice(last));
  return out;
};

const blockStartRe =
  /^(#{1,3}\s+|[-*]\s+|\d+\.\s+|>\s?|\[\[[^\]]+\]\]\(|(-{3,}|_{3,}|\*{3,})\s*$)/;

const buttonHtml = (
  label: string,
  url: string,
  resolveUrl?: UrlResolver,
): string => {
  const rawUrl = resolveUrl ? resolveUrl(url) : htmlUnescape(url);
  const safe = SAFE_URL_RE.test(rawUrl) ? rawUrl : '#';
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="border-radius:8px;background:${EMAIL_BRAND.red};"><a href="${escapeHtml(safe)}" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a></td></tr></table>`;
};

export const markdownToEmailHtml = (
  src: string,
  resolveUrl?: UrlResolver,
): string => {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  const inline = (t: string) => formatInline(t, resolveUrl);
  const para = `margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.body};`;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const size = h[1].length === 1 ? 22 : h[1].length === 2 ? 18 : 15.5;
      const mt = out.length ? 22 : 0;
      out.push(
        `<h${h[1].length} style="margin:${mt}px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:1.3;font-weight:700;color:${EMAIL_BRAND.ink};">${inline(escapeHtml(h[2].trim()))}</h${h[1].length}>`,
      );
      i += 1;
      continue;
    }
    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      out.push(
        `<hr style="border:none;border-top:1px solid ${EMAIL_BRAND.line};margin:20px 0;"/>`,
      );
      i += 1;
      continue;
    }
    const btn = /^\s*\[\[([^\]]+)\]\]\(([^)\s]+)\)\s*$/.exec(line);
    if (btn) {
      out.push(buttonHtml(btn[1], btn[2], resolveUrl));
      i += 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        q.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(
        `<blockquote style="margin:14px 0;padding:8px 16px;border-left:3px solid ${EMAIL_BRAND.red};background:${EMAIL_BRAND.quoteBg};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${inline(escapeHtml(q.join('\n'))).replaceAll('\n', '<br/>')}</blockquote>`,
      );
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(
          `<li style="margin:0 0 6px;">${inline(escapeHtml(lines[i].replace(/^[-*]\s+/, '')))}</li>`,
        );
        i += 1;
      }
      out.push(
        `<ul style="margin:0 0 14px;padding-left:22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${items.join('')}</ul>`,
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(
          `<li style="margin:0 0 6px;">${inline(escapeHtml(lines[i].replace(/^\d+\.\s+/, '')))}</li>`,
        );
        i += 1;
      }
      out.push(
        `<ol style="margin:0 0 14px;padding-left:22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.body};">${items.join('')}</ol>`,
      );
      continue;
    }
    const p: string[] = [lines[i]];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !blockStartRe.test(lines[i])
    ) {
      p.push(lines[i]);
      i += 1;
    }
    out.push(
      `<p style="${para}">${inline(escapeHtml(p.join('\n'))).replaceAll('\n', '<br/>')}</p>`,
    );
  }
  return out.join('\n');
};

// ── The branded layout ───────────────────────────────────────────────────────
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export const renderEmail = (args: {
  parsedSubject: ParsedTemplate;
  parsedBody: ParsedTemplate;
  values: MergeValues;
  language: 'EN' | 'AR';
  brokerageName: string;
  permitNumber?: string;
  unsubscribeUrl: string;
}): RenderedEmail => {
  const dir = args.language === 'AR' ? 'rtl' : 'ltr';
  const align = dir === 'rtl' ? 'right' : 'left';
  const values: MergeValues = {
    ...args.values,
    unsubscribeUrl: args.unsubscribeUrl,
  };
  const subject = renderParsed(args.parsedSubject, values, { escape: false })
    .replace(/\s+/g, ' ')
    .trim();
  const fieldVals: string[] = [];
  let bodyTemplate = '';
  for (let i = 0; i < args.parsedBody.segments.length; i += 1) {
    bodyTemplate += args.parsedBody.segments[i];
    if (i < args.parsedBody.fields.length) {
      fieldVals.push(values[args.parsedBody.fields[i] as MergeField] ?? '');
      bodyTemplate += `MRGFLD${fieldVals.length - 1}ENDMRGFLD`;
    }
  }
  const MARKER_RE = /MRGFLD(\d+)ENDMRGFLD/g;
  const resolveUrlMarkers = (escapedUrl: string): string =>
    htmlUnescape(escapedUrl).replace(
      MARKER_RE,
      (_m, n: string) => fieldVals[Number(n)] ?? '',
    );
  const bodyHtml = markdownToEmailHtml(bodyTemplate, resolveUrlMarkers).replace(
    MARKER_RE,
    (_m, n: string) => escapeHtml(fieldVals[Number(n)] ?? ''),
  );
  const bodyText = renderParsed(args.parsedBody, values, { escape: false });
  const permitLine = args.permitNumber
    ? `<div style="margin-top:16px;font-size:12px;color:${EMAIL_BRAND.muted};">Permit No. ${escapeHtml(args.permitNumber)}</div>`
    : '';
  const unsubLabel = args.language === 'AR' ? 'إلغاء الاشتراك' : 'Unsubscribe';
  const brand = escapeHtml(args.brokerageName);
  const html = `<!doctype html>
<html dir="${dir}" lang="${args.language.toLowerCase()}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>@media (max-width:620px){.p-card{width:100%!important;border-radius:0!important;}.p-pad{padding:24px 20px!important;}}</style>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.pageBg};-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_BRAND.pageBg};padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" class="p-card" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${EMAIL_BRAND.line};">
<tr><td style="height:4px;background:${EMAIL_BRAND.red};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="p-pad" style="padding:22px 36px;border-bottom:1px solid ${EMAIL_BRAND.line};">
<span style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:800;letter-spacing:-0.01em;color:${EMAIL_BRAND.ink};">${brand}</span>
</td></tr>
<tr><td class="p-pad" dir="${dir}" align="${align}" style="padding:32px 36px;text-align:${align};">
${bodyHtml}
${permitLine}
</td></tr>
<tr><td class="p-pad" style="padding:18px 36px;border-top:1px solid ${EMAIL_BRAND.line};background:${EMAIL_BRAND.pageBg};font-family:Arial,Helvetica,sans-serif;font-size:11.5px;line-height:1.6;color:${EMAIL_BRAND.muted};">
${brand}<br/>
<a href="${escapeHtml(args.unsubscribeUrl)}" style="color:${EMAIL_BRAND.muted};text-decoration:underline;">${unsubLabel}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  const text = `${bodyText}\n\n${args.permitNumber ? `Permit No. ${args.permitNumber}\n` : ''}${unsubLabel}: ${args.unsubscribeUrl}\n`;
  return { subject, html, text };
};
