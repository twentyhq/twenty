import { type AiChatPendingEmailApproval } from '@/ai-chat/tool-calls/types/AiChatPendingEmailApproval';

const buildEmailApproval = ({
  toolCallId,
  to,
  cc = '',
  subject,
  paragraphs,
}: {
  toolCallId: string;
  to: string;
  cc?: string;
  subject: string;
  paragraphs: string[];
}): AiChatPendingEmailApproval => ({
  toolCallId,
  proposal: {
    toolName: 'send_email',
    toolLabel: 'Send email',
    summary: subject,
    template: 'email',
    alternativeToolNames: ['draft_email'],
    arguments: {
      recipients: { to, cc, bcc: '' },
      subject,
      body: {
        type: 'doc',
        content: paragraphs.map((text) => ({
          type: 'paragraph',
          content: [{ type: 'text', text }],
        })),
      },
    },
  },
});

export const AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES: AiChatPendingEmailApproval[] =
  [
    buildEmailApproval({
      toolCallId: 'demo-follow-up',
      to: 'Brian Chesky <brian@example.com>, Joe Gebbia <joe@example.com>',
      subject: 'Following up on Tuesday’s demo',
      paragraphs: [
        'Hi Brian and Joe,',
        'Thanks again for the demo on Tuesday. You mentioned the ops team wanted to see how pipeline reporting works before the rollout, so I put together a short walkthrough.',
        'Would Thursday at 2pm work for a 20 minute call?',
        'Sarah',
      ],
    }),
    buildEmailApproval({
      toolCallId: 'reporting-walkthrough',
      to: 'Grace Hopper <grace@example.com>',
      cc: 'Ada Lovelace <ada@example.com>',
      subject: 'Pipeline reporting walkthrough',
      paragraphs: [
        'Hi Grace,',
        'Here is the reporting walkthrough we discussed. Please let me know which views would help your team.',
        'Sarah',
      ],
    }),
    buildEmailApproval({
      toolCallId: 'rollout-check-in',
      to: 'Katherine Johnson <katherine@example.com>',
      subject: 'Checking in before the rollout',
      paragraphs: [
        'Hi Katherine,',
        'Do you have everything you need for the rollout? I can share a short setup guide before our next call.',
        'Sarah',
      ],
    }),
    buildEmailApproval({
      toolCallId: 'pricing-question',
      to: 'Margaret Hamilton <margaret@example.com>',
      subject: 'Your question about seat pricing',
      paragraphs: [
        'Hi Margaret,',
        'Seats are billed monthly and you can add or remove them at any time. Happy to walk you through the plans on a call.',
        'Sarah',
      ],
    }),
    buildEmailApproval({
      toolCallId: 'renewal-reminder',
      to: 'Alan Turing <alan@example.com>',
      subject: 'Renewal coming up next month',
      paragraphs: [
        'Hi Alan,',
        'Your subscription renews on the 1st. Let me know if anything should change before then.',
        'Sarah',
      ],
    }),
  ];
