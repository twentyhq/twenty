import {
  BaseObjectMetadata,
  FieldMetadata,
  ObjectMetadata,
  FieldMetadataType,
} from 'twenty-sdk/application';

@ObjectMetadata({
  universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
  nameSingular: 'postCard',
  namePlural: 'postCards',
  labelSingular: 'Post card',
  labelPlural: 'Post cards',
  description: ' A post card object',
  icon: 'IconMail',
})
export class PostCard extends BaseObjectMetadata {
  @FieldMetadata({
    universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
    type: FieldMetadataType.TEXT,
    label: 'Content',
    description: "Postcard's content",
  })
  content: string;

  @FieldMetadata({
    universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
    type: FieldMetadataType.FULL_NAME,
    label: 'Recipient name',
  })
  recipientName: string;

  @FieldMetadata({
    universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
    type: FieldMetadataType.ADDRESS,
    label: 'Recipient address',
  })
  recipientAddress: string;

  @FieldMetadata({
    universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
    type: FieldMetadataType.SELECT,
    label: 'Status',
    defaultValue: 'draft',
    options: [
      {
        value: 'draft',
        label: 'Draft',
        position: 0,
        color: 'gray',
      },
      {
        value: 'sent',
        label: 'Sent',
        position: 1,
        color: 'orange',
      },
      {
        value: 'delivered',
        label: 'Delivered',
        position: 2,
        color: 'green',
      },
      {
        value: 'returned',
        label: 'Returned',
        position: 3,
        color: 'orange',
      },
    ],
  })
  status: 'draft' | 'sent' | 'delivered' | 'returned';

  //  notes?: string // optional internal notes or comments

  @FieldMetadata({
    universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
    type: FieldMetadataType.DATE_TIME,
    label: 'Delivered at',
    isNullable: true,
    defaultValue: null,
  })
  deliveredAt?: Date;
}
