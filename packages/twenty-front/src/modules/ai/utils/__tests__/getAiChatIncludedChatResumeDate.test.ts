import { getAiChatIncludedChatResumeDate } from '@/ai/utils/getAiChatIncludedChatResumeDate';

describe('getAiChatIncludedChatResumeDate', () => {
  it('resumes at the next UTC midnight', () => {
    expect(
      getAiChatIncludedChatResumeDate(
        new Date('2026-10-07T15:42:00.000Z'),
      ).toISOString(),
    ).toBe('2026-10-08T00:00:00.000Z');
  });

  it('resumes the next day when it is already past midnight UTC', () => {
    expect(
      getAiChatIncludedChatResumeDate(
        new Date('2026-12-31T00:00:00.000Z'),
      ).toISOString(),
    ).toBe('2027-01-01T00:00:00.000Z');
  });
});
