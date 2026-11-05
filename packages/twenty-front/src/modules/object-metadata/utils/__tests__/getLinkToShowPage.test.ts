import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

describe('getLinkToShowPage', () => {
  it('links a record to its record page', () => {
    expect(
      getLinkToShowPage({
        objectNameSingular: 'company',
        record: { id: 'company-id' },
      }),
    ).toBe('/object/company/company-id');
  });

  it.each(['agentChatThread', 'inboxThread'])(
    'links a chat named %s to the chat page',
    (objectNameSingular) => {
      expect(
        getLinkToShowPage({
          objectNameSingular,
          objectUniversalIdentifier:
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
          record: { id: 'chat-id' },
        }),
      ).toBe('/chat/chat-id');
    },
  );

  it('links nowhere without a record id', () => {
    expect(
      getLinkToShowPage({ objectNameSingular: 'agentChatThread', record: {} }),
    ).toBe('');
  });

  it('does not classify another object by its name', () => {
    expect(
      getLinkToShowPage({
        objectNameSingular: 'agentChatThread',
        objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        record: { id: 'record-id' },
      }),
    ).toBe('/object/agentChatThread/record-id');
  });
});
