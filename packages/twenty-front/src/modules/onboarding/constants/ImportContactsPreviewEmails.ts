import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type ImportContactsPreviewEmail = {
  id: string;
  sender: string;
  subject?: string | MessageDescriptor;
  senderColor: 'primary' | 'secondary' | 'tertiary';
  isSenderMedium: boolean;
  isSelected: boolean;
};

export const IMPORT_CONTACTS_PREVIEW_EMAILS = [
  {
    id: 'acme',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Fixture sender is a proper name.
    sender: 'Acme Inc.',
    subject: msg`Insights: The latest in industrial equipment and tools`,
    senderColor: 'secondary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'dylan-field',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Fixture sender is a proper name.
    sender: 'Dylan Field',
    // oxlint-disable lingui/no-unlocalized-strings -- Placeholder Latin has no translated meaning.
    subject:
      'Lorem ipsum dolor sit amet consectetur. Ac eget eu eget ullamcorper tellus sem scelerisque sit ante.',
    // oxlint-enable lingui/no-unlocalized-strings
    senderColor: 'primary',
    isSenderMedium: false,
    isSelected: false,
  },
  {
    id: 'dario-amodei',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Fixture sender is a proper name.
    sender: 'Dario Amodei',
    senderColor: 'primary',
    isSenderMedium: true,
    isSelected: true,
  },
  {
    id: 'ivan-zhao',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Fixture sender is a proper name.
    sender: 'Ivan Zhao',
    subject: msg`Our latest Adventures and Destinations`,
    senderColor: 'tertiary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'brian-chesky',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Fixture sender is a proper name.
    sender: 'Brian Chesky',
    subject: msg`Insights: Industry trends and best practices`,
    senderColor: 'tertiary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'stewart-butterfield',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Fixture sender is a proper name.
    sender: 'Stewart Butterfield',
    subject: msg`Our Complete list of Recipe Ideas and Restaurant Reviews!`,
    senderColor: 'secondary',
    isSenderMedium: true,
    isSelected: false,
  },
] satisfies ImportContactsPreviewEmail[];
