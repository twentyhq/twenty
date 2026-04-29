import { defineSkill } from 'twenty-sdk/define';

export default defineSkill({
  universalIdentifier: 'a7c3e1f2-8b4d-4e6a-9f01-2d3c4b5a6e7f',
  name: 'postcard-writing-guidelines',
  label: 'Postcard Writing Guidelines',
  icon: 'IconPencil',
  description: 'Guidelines for writing effective postcards',
  content:
    'When writing a postcard: keep the message under 150 words, use a warm ' +
    'and personal tone, mention the recipient by name, and include a clear ' +
    'call-to-action if the postcard is business-related. Always fill in both ' +
    'the recipientName and recipientAddress fields before marking the status ' +
    'as SENT.',
});
