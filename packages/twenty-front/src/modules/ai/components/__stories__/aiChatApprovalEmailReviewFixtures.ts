import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { type AiChatApprovalReviewEmail } from '@/ai/types/AiChatApprovalReviewEmail';

const serializeParagraphs = (paragraphs: string[]) =>
  serializeJsonContentAsAdvancedTextEditorDocument({
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  });

export const AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES: readonly AiChatApprovalReviewEmail[] =
  [
    {
      id: 'demo-follow-up',
      status: 'pending',
      draft: {
        to: [
          { address: 'brian@example.com', displayName: 'Brian Chesky' },
          { address: 'joe@example.com', displayName: 'Joe Gebbia' },
        ],
        cc: [],
        bcc: [],
        isCcBccExpanded: false,
        subject: 'Following up on Tuesday’s demo',
        body: serializeParagraphs([
          'Hi Brian and Joe,',
          'Thanks again for the demo on Tuesday. You mentioned the ops team wanted to see how pipeline reporting works before the rollout, so I put together a short walkthrough.',
          'Would Thursday at 2pm work for a 20 minute call?',
          'Sarah',
        ]),
      },
    },
    {
      id: 'reporting-walkthrough',
      status: 'pending',
      draft: {
        to: [{ address: 'grace@example.com', displayName: 'Grace Hopper' }],
        cc: [{ address: 'ada@example.com', displayName: 'Ada Lovelace' }],
        bcc: [],
        isCcBccExpanded: true,
        subject: 'Pipeline reporting walkthrough',
        body: serializeParagraphs([
          'Hi Grace,',
          'Here is the reporting walkthrough we discussed. Please let me know which views would help your team.',
          'Sarah',
        ]),
      },
    },
    {
      id: 'rollout-check-in',
      status: 'pending',
      draft: {
        to: [
          {
            address: 'katherine@example.com',
            displayName: 'Katherine Johnson',
          },
        ],
        cc: [],
        bcc: [],
        isCcBccExpanded: false,
        subject: 'Checking in before the rollout',
        body: serializeParagraphs([
          'Hi Katherine,',
          'Do you have everything you need for the rollout? I can share a short setup guide before our next call.',
          'Sarah',
        ]),
      },
    },
  ];
