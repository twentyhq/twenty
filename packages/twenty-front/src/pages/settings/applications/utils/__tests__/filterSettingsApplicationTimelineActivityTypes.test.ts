import { filterSettingsApplicationTimelineActivityTypes } from '~/pages/settings/applications/utils/filterSettingsApplicationTimelineActivityTypes';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';

const timelineActivityTypes: SettingsApplicationTimelineActivityType[] = [
  {
    action: 'restored',
    icon: 'IconPaperclip',
    id: 'attachment-linked',
    isActive: true,
    label: 'Attached a file',
    name: 'attachmentLinked',
    universalIdentifier: 'attachment-linked-universal-identifier',
  },
  {
    action: 'unlinked',
    icon: 'IconUnlink',
    id: 'attachment-unlinked',
    isActive: false,
    label: 'Removed an attachment',
    name: 'attachmentUnlinked',
    universalIdentifier: 'attachment-unlinked-universal-identifier',
  },
];

describe('filterSettingsApplicationTimelineActivityTypes', () => {
  it('returns every type for an empty search', () => {
    expect(
      filterSettingsApplicationTimelineActivityTypes({
        timelineActivityTypes,
        searchTerm: '  ',
      }),
    ).toEqual(timelineActivityTypes);
  });

  it.each([
    ['label', 'FILE', 'attachment-linked'],
    ['name', 'attachmentUnlinked', 'attachment-unlinked'],
    ['action', 'restored', 'attachment-linked'],
  ])('filters by %s', (_field, searchTerm, expectedId) => {
    expect(
      filterSettingsApplicationTimelineActivityTypes({
        timelineActivityTypes,
        searchTerm,
      }).map(({ id }) => id),
    ).toEqual([expectedId]);
  });
});
