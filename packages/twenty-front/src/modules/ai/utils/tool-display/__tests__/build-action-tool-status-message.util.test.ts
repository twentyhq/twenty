import { i18n } from '@lingui/core';

import { buildActionToolStatusMessage } from '@/ai/utils/tool-display/build-action-tool-status-message.util';
import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('buildActionToolStatusMessage', () => {
  it('should use custom status labels when defined', () => {
    const displayContext: ToolDisplayContext = {
      labelByName: new Map([['send_email', 'Send Email']]),
      indexByName: new Map(),
      objectMetadataItems: [],
    };

    expect(
      buildActionToolStatusMessage({
        toolName: 'send_email',
        isFinished: false,
        displayContext,
      }),
    ).toBe('Sending email');

    expect(
      buildActionToolStatusMessage({
        toolName: 'send_email',
        isFinished: true,
        displayContext,
      }),
    ).toBe('Sent email');
  });

  it('should fall back to default Ran/Running when no custom status labels exist', () => {
    const displayContext: ToolDisplayContext = {
      labelByName: new Map([['http_request', 'HTTP Request']]),
      indexByName: new Map(),
      objectMetadataItems: [],
    };

    expect(
      buildActionToolStatusMessage({
        toolName: 'http_request',
        isFinished: false,
        displayContext,
      }),
    ).toContain('Running');
    expect(
      buildActionToolStatusMessage({
        toolName: 'http_request',
        isFinished: true,
        displayContext,
      }),
    ).toContain('Ran');
  });
});
