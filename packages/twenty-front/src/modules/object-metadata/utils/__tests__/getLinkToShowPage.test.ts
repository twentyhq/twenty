import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';

describe('getLinkToShowPage', () => {
  it('links a record to its record page', () => {
    expect(getLinkToShowPage('company', { id: 'company-id' })).toBe(
      '/object/company/company-id',
    );
  });

  it('links a chat to the chat page', () => {
    expect(getLinkToShowPage('agentChatThread', { id: 'chat-id' })).toBe(
      '/chat/chat-id',
    );
  });

  it('links nowhere without a record id', () => {
    expect(getLinkToShowPage('agentChatThread', {})).toBe('');
  });
});
