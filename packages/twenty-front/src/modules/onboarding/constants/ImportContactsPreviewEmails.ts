export type ImportContactsPreviewEmail = {
  id: string;
  sender: string;
  subject?: string;
  senderColor: 'primary' | 'secondary' | 'tertiary';
  isSenderMedium: boolean;
  isSelected: boolean;
};

export const IMPORT_CONTACTS_PREVIEW_EMAILS = [
  {
    id: 'acme',
    sender: 'Acme Inc.',
    subject: 'Insights: The latest in industrial equipment and tools',
    senderColor: 'secondary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'dylan-field',
    sender: 'Dylan Field',
    subject:
      'Lorem ipsum dolor sit amet consectetur. Ac eget eu eget ullamcorper tellus sem scelerisque sit ante.',
    senderColor: 'primary',
    isSenderMedium: false,
    isSelected: false,
  },
  {
    id: 'dario-amodei',
    sender: 'Dario Amodei',
    senderColor: 'primary',
    isSenderMedium: true,
    isSelected: true,
  },
  {
    id: 'ivan-zhao',
    sender: 'Ivan Zhao',
    subject: 'Our latest Adventures and Destinations',
    senderColor: 'tertiary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'brian-chesky',
    sender: 'Brian Chesky',
    subject: 'Insights: Industry trends and best practices',
    senderColor: 'tertiary',
    isSenderMedium: true,
    isSelected: false,
  },
  {
    id: 'stewart-butterfield',
    sender: 'Stewart Butterfield',
    subject: 'Our Complete list of Recipe Ideas and Restaurant Reviews!',
    senderColor: 'secondary',
    isSenderMedium: true,
    isSelected: false,
  },
] satisfies ImportContactsPreviewEmail[];
