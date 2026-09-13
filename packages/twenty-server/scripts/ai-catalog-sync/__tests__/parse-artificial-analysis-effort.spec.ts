import { parseArtificialAnalysisEffort } from '../utils/parse-artificial-analysis-effort.util';

describe('parseArtificialAnalysisEffort', () => {
  it.each([
    ['GPT-5.6 Sol (max)', 'max'],
    ['GPT-5.4 (xhigh)', 'xhigh'],
    ['Grok 4.6 (high)', 'high'],
    ['Gemini 3.5 Flash (medium)', 'medium'],
    ['GPT-5 nano (minimal)', 'minimal'],
    ['Claude Opus 5 (Adaptive Reasoning, Max Effort)', 'max'],
    [
      'Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback)',
      'max',
    ],
    ['Claude Sonnet 4.6 (Non-reasoning, Low Effort)', 'low'],
    ['GPT-5.6 Luna (Non-reasoning)', 'none'],
  ])('reads "%s" as %s', (displayName, effort) => {
    expect(parseArtificialAnalysisEffort(displayName)).toBe(effort);
  });

  it.each([
    'Claude Opus 4.5 (Reasoning)',
    'Gemini 3.1 Pro Preview',
    'GPT-4o (March 2025, chatgpt-4o-latest)',
    "Llama 3.1 405B (May '24)",
    'Mistral Large 3 (high) Turbo',
  ])('names no effort for "%s"', (displayName) => {
    expect(parseArtificialAnalysisEffort(displayName)).toBeUndefined();
  });
});
