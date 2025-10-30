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
    universalIdentifier: 'e3ba9d3d-98b6-4635-8491-52906e31885b',
    type: FieldMetadataType.TEXT,
    label: 'Name',
  })
  name: string;
}
