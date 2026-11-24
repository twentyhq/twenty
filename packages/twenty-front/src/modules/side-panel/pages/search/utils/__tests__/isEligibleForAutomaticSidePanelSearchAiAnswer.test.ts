import { isEligibleForAutomaticSidePanelSearchAiAnswer } from '@/side-panel/pages/search/utils/isEligibleForAutomaticSidePanelSearchAiAnswer';

describe('isEligibleForAutomaticSidePanelSearchAiAnswer', () => {
  it.each([
    ['Acme', false],
    ['Acme website', false],
    ['Acme Paris office', false],
    ['who', false],
    ['Acme website?', true],
    ["What is Acme's website", true],
    ['Who is Acme', true],
    ['où est Acme', true],
    ['Acme Paris office address', true],
  ])('"%s" → %s', (query, isEligible) => {
    expect(isEligibleForAutomaticSidePanelSearchAiAnswer(query)).toBe(
      isEligible,
    );
  });
});
