import { describe, expect, it } from 'vitest';

import { parseTeamsTranscriptSummaryAgentResponse } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-summary-agent-response';

const buildAgentResult = (response: unknown) => ({
  success: true,
  error: null,
  result: { response },
});

describe('parseTeamsTranscriptSummaryAgentResponse', () => {
  it('should return the trimmed Markdown summary', () => {
    expect(
      parseTeamsTranscriptSummaryAgentResponse(
        buildAgentResult('\n## Gist\nPricing was agreed.\n'),
      ),
    ).toEqual({
      outcome: 'summarized',
      markdown: '## Gist\nPricing was agreed.',
    });
  });

  it('should return the reason when the transcript cannot be summarized', () => {
    expect(
      parseTeamsTranscriptSummaryAgentResponse(
        buildAgentResult(
          'SUMMARY_UNAVAILABLE: The transcript only contains audio checks.',
        ),
      ),
    ).toEqual({
      outcome: 'not-summarizable',
      reason: 'The transcript only contains audio checks.',
    });
  });

  it('should return undefined for a failed run, a blank response or a bare unavailable marker', () => {
    expect(
      parseTeamsTranscriptSummaryAgentResponse({
        success: false,
        error: 'Agent run failed',
        result: null,
      }),
    ).toBeUndefined();
    expect(
      parseTeamsTranscriptSummaryAgentResponse(buildAgentResult('   ')),
    ).toBeUndefined();
    expect(
      parseTeamsTranscriptSummaryAgentResponse(buildAgentResult(42)),
    ).toBeUndefined();
    expect(
      parseTeamsTranscriptSummaryAgentResponse(
        buildAgentResult('SUMMARY_UNAVAILABLE:  '),
      ),
    ).toBeUndefined();
  });
});
