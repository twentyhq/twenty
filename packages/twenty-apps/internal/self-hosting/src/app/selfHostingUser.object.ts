import { FieldType, defineObject } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: '06f3fb53-599e-4c6b-9df6-8f731973afd7',
  nameSingular: 'selfHostingUser',
  namePlural: 'selfHostingUsers',
  labelSingular: 'Self Hosting User',
  labelPlural: 'Self Hosting Users',
  fields: [
    {
      type: FieldType.EMAILS,
      name: 'email',
      label: 'Email',
      description: 'The email of the self hosting user',
      universalIdentifier: 'a4b7892c-431a-4d44-973e-a5481652704f',
    },
  ],
});
