import { getInboxItemIconName } from '@/inbox/utils/getInboxItemIconName';
import {
  type InboxItem,
  InboxItemContextSourceKind,
  type InboxItemToolCall,
} from '~/generated/graphql';

const buildInboxItem = (
  overrides: Partial<InboxItem> = {},
): Pick<
  InboxItem,
  'icon' | 'threadId' | 'subjectRecordId' | 'context' | 'toolCalls'
> => ({
  icon: null,
  threadId: null,
  subjectRecordId: null,
  context: { version: 1, producer: 'seed' } as InboxItem['context'],
  toolCalls: [],
  ...overrides,
});

describe('getInboxItemIconName', () => {
  it('should let the producer name the icon', () => {
    expect(
      getInboxItemIconName({
        inboxItem: buildInboxItem({
          icon: 'IconHelpCircle',
          threadId: 'thread',
        }),
        subjectObjectIcon: 'IconBuilding',
      }),
    ).toBe('IconHelpCircle');
  });

  it('should draw an agent conversation as a chat', () => {
    expect(
      getInboxItemIconName({
        inboxItem: buildInboxItem({ threadId: 'thread' }),
        subjectObjectIcon: undefined,
      }),
    ).toBe('IconMessageCircle');
  });

  it('should take the subject object icon for an item about a record', () => {
    expect(
      getInboxItemIconName({
        inboxItem: buildInboxItem({ subjectRecordId: 'acme' }),
        subjectObjectIcon: 'IconBuildingSkyscraper',
      }),
    ).toBe('IconBuildingSkyscraper');
  });

  it('should fall back to where the item came from', () => {
    expect(
      getInboxItemIconName({
        inboxItem: buildInboxItem({
          context: {
            version: 1,
            producer: 'seed',
            source: { kind: InboxItemContextSourceKind.CALL, label: 'Call' },
          } as InboxItem['context'],
        }),
        subjectObjectIcon: undefined,
      }),
    ).toBe('IconPhone');
  });

  it('should fall back to the first step of the plan, then to the inbox icon', () => {
    expect(
      getInboxItemIconName({
        inboxItem: buildInboxItem({
          toolCalls: [{ icon: 'IconCheckbox' } as InboxItemToolCall],
        }),
        subjectObjectIcon: undefined,
      }),
    ).toBe('IconCheckbox');

    expect(
      getInboxItemIconName({
        inboxItem: buildInboxItem(),
        subjectObjectIcon: undefined,
      }),
    ).toBe('IconInbox');
  });
});
