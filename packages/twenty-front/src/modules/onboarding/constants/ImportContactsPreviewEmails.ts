import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';

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
    sender: doNotTranslate('Acme Inc.'),
    subject: msg`Insights: The latest in industrial equipment and tools`,
    senderColor: 'secondary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'dylan-field',
    sender: doNotTranslate('Dylan Field'),
    subject: doNotTranslate(
      'Lorem ipsum dolor sit amet consectetur. Ac eget eu eget ullamcorper tellus sem scelerisque sit ante.',
    ),
    senderColor: 'primary',
    isSenderMedium: false,
    isSelected: false,
  },
  {
    id: 'dario-amodei',
    sender: doNotTranslate('Dario Amodei'),
    senderColor: 'primary',
    isSenderMedium: true,
    isSelected: true,
  },
  {
    id: 'ivan-zhao',
    sender: doNotTranslate('Ivan Zhao'),
    subject: msg`Our latest Adventures and Destinations`,
    senderColor: 'tertiary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'brian-chesky',
    sender: doNotTranslate('Brian Chesky'),
    subject: msg`Insights: Industry trends and best practices`,
    senderColor: 'tertiary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'stewart-butterfield',
    sender: doNotTranslate('Stewart Butterfield'),
    subject: msg`Our Complete list of Recipe Ideas and Restaurant Reviews!`,
    senderColor: 'secondary',
    isSenderMedium: true,
    isSelected: false,
  },
] satisfies ImportContactsPreviewEmail[];
