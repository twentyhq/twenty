export type ImportContactsPreviewEmail = {
  id: string;
  sender: string;
  subject: string;
  date: string;
  isUnread: boolean;
};

export const IMPORT_CONTACTS_PREVIEW_EMAILS = [
  {
    id: 'acme',
    sender: 'Acme Inc.',
    subject: 'Insights: The latest in industrial equipment and tools',
    date: 'Feb, 26',
    isUnread: false,
  },
  {
    id: 'dylan-field',
    sender: 'Dylan Field',
    subject:
      'Lorem ipsum dolor sit amet consectetur. Ac eget eu eget ullamcorper tellus sem scelerisque sit ante.',
    date: '12/12/23',
    isUnread: false,
  },
  {
    id: 'dario-amodei',
    sender: 'Dario Amodei',
    subject:
      'Delta Weekly News: Learn about important safety tips before you fly!',
    date: 'Jan, 26',
    isUnread: true,
  },
  {
    id: 'ivan-zhao',
    sender: 'Ivan Zhao',
    subject: 'Our latest Adventures and Destinations',
    date: 'March, 26',
    isUnread: false,
  },
  {
    id: 'brian-chesky',
    sender: 'Brian Chesky',
    subject: 'Insights: Industry trends and best practices',
    date: 'Jan, 26',
    isUnread: false,
  },
  {
    id: 'figma-sames',
    sender: 'Figma sames',
    subject: 'Our Complete list of Recipe Ideas and Restaurant Reviews!',
    date: 'Jan, 26',
    isUnread: false,
  },
] satisfies ImportContactsPreviewEmail[];
