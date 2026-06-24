import { i18n } from '@lingui/core';
import { ToolCategory } from 'twenty-shared/ai';

import { buildCrudToolStatusMessage } from '@/ai/utils/tool-display/build-crud-tool-status-message.util';
import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';

beforeEach(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('buildCrudToolStatusMessage', () => {
  const displayContext: ToolDisplayContext = {
    labelByName: new Map([['find_many_people', 'Search people']]),
    indexByName: new Map([
      [
        'find_many_people',
        { category: ToolCategory.DATABASE_CRUD, objectName: 'person' },
      ],
    ]),
    objectMetadataItems: [
      {
        nameSingular: 'person',
        namePlural: 'people',
        labelSingular: 'Contact',
        labelPlural: 'Contacts',
      },
    ] as ToolDisplayContext['objectMetadataItems'],
  };

  it('should build in-progress and completed labels from metadata', () => {
    expect(
      buildCrudToolStatusMessage({
        toolName: 'find_many_people',
        isFinished: false,
        displayContext,
      }),
    ).toBe('Searching contacts');

    expect(
      buildCrudToolStatusMessage({
        toolName: 'find_many_people',
        isFinished: true,
        displayContext,
      }),
    ).toBe('Searched contacts');
  });

  it('should return null for non-CRUD tool names', () => {
    expect(
      buildCrudToolStatusMessage({
        toolName: 'send_email',
        isFinished: true,
        displayContext,
      }),
    ).toBeNull();
  });
});
