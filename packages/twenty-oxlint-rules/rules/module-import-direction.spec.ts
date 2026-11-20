import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './module-import-direction';

const ruleTester = new RuleTester();

const options = [
  {
    directions: [
      {
        sourcePath: '/src/modules/ai/',
        forbiddenImportPrefixes: ['@/inbox/'],
        ignoredSourcePaths: [
          '/__tests__/',
          '/__stories__/',
          '/src/modules/ai/testing/',
        ],
        reason: 'the AI chat must not depend on the inbox.',
      },
      {
        sourcePath: '/src/modules/ai-chat/threads/',
        forbiddenImportPrefixes: ['@/ai-chat/composer/', '@/ai-chat/messages/'],
        reason: 'threads sit below the composer and messages.',
      },
    ],
  },
];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: "import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';",
      filename:
        '/repo/packages/twenty-front/src/modules/inbox/hooks/useLoadInboxThreadList.ts',
      options,
    },
    {
      code: "import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';",
      filename: '/repo/packages/twenty-front/src/modules/ai/hooks/useAiChat.ts',
      options,
    },
    {
      code: "import { setInboxThreadList } from '@/inbox/testing/setInboxThreadList';",
      filename:
        '/repo/packages/twenty-front/src/modules/ai/components/__tests__/AiChatTab.test.tsx',
      options,
    },
    {
      code: "import { initializeNewAiChatStory } from '@/inbox/testing/initializeNewAiChatStory';",
      filename:
        '/repo/packages/twenty-front/src/modules/ai/components/__stories__/AiChatTab.stories.tsx',
      options,
    },
    {
      code: "import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';",
      filename:
        '/repo/packages/twenty-front/src/modules/ai-chat/messages/components/AiChatMessage.tsx',
      options,
    },
  ],
  invalid: [
    {
      code: "import { getAiChatSenderLabel } from '@/ai-chat/messages/utils/getAiChatSenderLabel';",
      filename:
        '/repo/packages/twenty-front/src/modules/ai-chat/threads/utils/getAiChatThreadPreviewText.ts',
      options,
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      code: "import { aiChatDraftsByThreadIdState } from '@/ai-chat/composer/states/aiChatDraftsByThreadIdState';",
      filename:
        '/repo/packages/twenty-front/src/modules/ai-chat/threads/hooks/useAiChatThreadSubtitleContent.ts',
      options,
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      code: "import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';",
      filename:
        'C:\\repo\\packages\\twenty-front\\src\\modules\\ai\\hooks\\useAiChat.ts',
      options,
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      code: "import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';",
      filename: '/repo/packages/twenty-front/src/modules/ai/hooks/useAiChat.ts',
      options,
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      code: "export { InboxPage } from '@/inbox/components/InboxPage';",
      filename:
        '/repo/packages/twenty-front/src/modules/ai/components/index.ts',
      options,
      errors: [{ messageId: 'forbiddenImport' }],
    },
    {
      code: "const loadInboxPage = () => import('@/inbox/components/InboxPage');",
      filename:
        '/repo/packages/twenty-front/src/modules/ai/utils/loadInboxPage.ts',
      options,
      errors: [{ messageId: 'forbiddenImport' }],
    },
  ],
});
