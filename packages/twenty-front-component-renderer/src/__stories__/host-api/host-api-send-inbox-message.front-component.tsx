import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { sendInboxMessage } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  BUTTON_STYLE,
  STATUS_STYLE,
} from '@/__stories__/shared/front-components/styles';

const HostApiSendInboxMessageFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      const { threadId } = await sendInboxMessage({
        workspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
        threadKey: 'host-api-send-inbox-message',
        idempotencyKey: 'host-api-send-inbox-message',
        title: 'Sent from a front component',
        text: 'This message was posted by a front component.',
      });
      setStatus(`sendInboxMessage:success:${threadId}`);
    } catch (error) {
      setStatus(
        `sendInboxMessage:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:send-inbox-message">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Send inbox message
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-inbox-00000000-0000-0000-0000-000000000020',
  name: 'host-api-send-inbox-message-front-component',
  description: 'Front component covering sendInboxMessage',
  component: HostApiSendInboxMessageFrontComponent,
});
