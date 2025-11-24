import { FieldMetadata, FieldMetadataType, ObjectMetadata } from 'twenty-sdk/application';

@ObjectMetadata({
  universalIdentifier: '06f3fb53-599e-4c6b-9df6-8f731973afd7',
  nameSingular: 'selfHostingUser',
  namePlural: 'selfHostingUsers',
  labelSingular: 'Self Hosting User',
  labelPlural: 'Self Hosting Users',
})
export class SelfHostingUser {
  @FieldMetadata({
    type: FieldMetadataType.EMAILS,
    label: 'Email',
    description: 'The email of the self hosting user',
    universalIdentifier: '06f3fb53-599e-4c6b-9df6-8f731973afd7',
  })
  email: object;
}
