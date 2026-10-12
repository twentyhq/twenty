import { i18n } from '@lingui/core';
import { ToolCategory } from 'twenty-shared/ai';

import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { buildToolStatusMessageByCategory } from '@/ai/utils/tool-display/buildToolStatusMessageByCategory';

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('buildToolStatusMessageByCategory', () => {
  it('should use custom status labels for action tools when defined', () => {
    const displayContext: ToolDisplayContext = {
      labelByName: new Map([['send_email', 'Send Email']]),
      indexByName: new Map([['send_email', { category: ToolCategory.ACTION }]]),
      objectMetadataItems: [],
    };

    expect(
      buildToolStatusMessageByCategory({
        toolName: 'send_email',
        isFinished: false,
        displayContext,
      }),
    ).toBe('Sending email');

    expect(
      buildToolStatusMessageByCategory({
        toolName: 'send_email',
        isFinished: true,
        displayContext,
      }),
    ).toBe('Sent email');
  });

  it('should fall back to default Ran/Running when no custom status labels exist', () => {
    const displayContext: ToolDisplayContext = {
      labelByName: new Map([['http_request', 'HTTP Request']]),
      indexByName: new Map([
        ['http_request', { category: ToolCategory.ACTION }],
      ]),
      objectMetadataItems: [],
    };

    expect(
      buildToolStatusMessageByCategory({
        toolName: 'http_request',
        isFinished: false,
        displayContext,
      }),
    ).toBe('Running HTTP Request');
    expect(
      buildToolStatusMessageByCategory({
        toolName: 'http_request',
        isFinished: true,
        displayContext,
      }),
    ).toBe('Ran HTTP Request');
  });
});
