import { type CommandMenuContextApi } from 'twenty-shared/types';

import { getCommandMenuItemObjectSectionHeading } from '@/command-menu-item/utils/getCommandMenuItemObjectSectionHeading';

const buildContextApi = (objectMetadataItem: Record<string, unknown>) =>
  ({ objectMetadataItem }) as unknown as CommandMenuContextApi;

describe('getCommandMenuItemObjectSectionHeading', () => {
  it('names the section after the object', () => {
    expect(
      getCommandMenuItemObjectSectionHeading({
        commandMenuContextApi: buildContextApi({ labelPlural: 'Companies' }),
        fallbackHeading: 'This object',
      }),
    ).toBe('Companies');
  });

  it('capitalizes a sentence-cased label', () => {
    expect(
      getCommandMenuItemObjectSectionHeading({
        commandMenuContextApi: buildContextApi({
          labelPlural: 'Survey results',
        }),
        fallbackHeading: 'This object',
      }),
    ).toBe('Survey results');
  });

  it.each([
    { name: 'no object in context', objectMetadataItem: {} },
    { name: 'an empty label', objectMetadataItem: { labelPlural: '' } },
    { name: 'a non-string label', objectMetadataItem: { labelPlural: 12 } },
  ])('falls back on $name', ({ objectMetadataItem }) => {
    expect(
      getCommandMenuItemObjectSectionHeading({
        commandMenuContextApi: buildContextApi(objectMetadataItem),
        fallbackHeading: 'This object',
      }),
    ).toBe('This object');
  });
});
