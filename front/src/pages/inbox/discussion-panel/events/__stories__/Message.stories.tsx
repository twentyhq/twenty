import Message from '../Message';

export default {
  title: 'DiscussionPanel',
  component: Message,
};

export const MessageDefault = () => (
  <Message
    message={{
      id: 1,
      time: '2 hours ago',
      user: 'Georges Alain',
      channel: 'sms',
      message:
        'I’m looking for my order but couldn’t find it. Could you help me find it. I don’t know where to look for.',
    }}
  />
);
