import { describe, expect, it } from 'vitest';

import { parseAccountBriefResponse } from 'src/logic-functions/domain/parse-account-brief-response.util';

describe('parseAccountBriefResponse', () => {
  it('splits the brief and the trailing sentiment line', () => {
    const raw = [
      '## Tình hình',
      'Khách vừa ký gia hạn 2 tuần trước.',
      '',
      '## Bước tiếp theo',
      '- Gửi báo giá cập nhật.',
      '',
      'SENTIMENT: POSITIVE',
    ].join('\n');

    const parsed = parseAccountBriefResponse(raw);

    expect(parsed.sentiment).toBe('POSITIVE');
    expect(parsed.briefMarkdown).toContain('## Tình hình');
    expect(parsed.briefMarkdown).toContain('Gửi báo giá cập nhật.');
    expect(parsed.briefMarkdown).not.toContain('SENTIMENT:');
  });

  it('is case insensitive on the sentiment line and trims it', () => {
    const parsed = parseAccountBriefResponse('Brief.\nsentiment:   mixed');

    expect(parsed.sentiment).toBe('MIXED');
    expect(parsed.briefMarkdown).toBe('Brief.');
  });

  it('falls back to NEUTRAL and keeps the full text on a missing sentiment line', () => {
    const raw = '## Tình hình\nKhông có tín hiệu rõ ràng.';

    const parsed = parseAccountBriefResponse(raw);

    expect(parsed.sentiment).toBe('NEUTRAL');
    expect(parsed.briefMarkdown).toBe(raw);
  });

  it('falls back to NEUTRAL on an unknown sentiment value', () => {
    const parsed = parseAccountBriefResponse('Brief.\nSENTIMENT: ECSTATIC');

    expect(parsed.sentiment).toBe('NEUTRAL');
    expect(parsed.briefMarkdown).toBe('Brief.');
  });

  it('falls back to NEUTRAL when the brief body would be empty', () => {
    const parsed = parseAccountBriefResponse('SENTIMENT: POSITIVE');

    expect(parsed.sentiment).toBe('NEUTRAL');
    expect(parsed.briefMarkdown).toBe('SENTIMENT: POSITIVE');
  });
});
