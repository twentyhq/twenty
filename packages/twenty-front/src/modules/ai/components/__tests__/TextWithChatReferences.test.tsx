import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { renderToStaticMarkup } from 'react-dom/server.node';
import { formatRecordReference } from 'twenty-shared/ai';

jest.mock('@/ai/components/ChatReferenceChip', () => ({
  ChatReferenceChip: () => <span>Record chip</span>,
}));

describe('TextWithChatReferences', () => {
  it('renders saved assistant labels as text alongside ordinary record chips and legacy prose', () => {
    const displayName = 'Scout: [[team]] *assistant* <script> 100%';
    const reference = formatRecordReference({
      objectNameSingular: 'agentChatAssistant',
      recordId: 'agentChatAssistant',
      displayName,
    });
    const markup = renderToStaticMarkup(
      <TextWithChatReferences
        text={`Ask ${reference} about [[record:company:11111111-1111-1111-1111-111111111111:Acme]], @Ada wrote this.`}
      />,
    );
    const document = new DOMParser().parseFromString(markup, 'text/html');

    expect(document.body.textContent).toBe(
      `Ask @${displayName} about Record chip, @Ada wrote this.`,
    );
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('a')).toBeNull();
  });
});
