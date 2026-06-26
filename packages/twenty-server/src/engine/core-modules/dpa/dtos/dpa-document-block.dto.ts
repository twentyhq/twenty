import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { DpaDocumentBlockKind } from 'src/engine/core-modules/dpa/enums/dpa-document-block-kind.enum';

registerEnumType(DpaDocumentBlockKind, { name: 'DpaDocumentBlockKind' });

// A single resolved block of the DPA, sent to the frontend so it can render the
// document as React elements (no HTML injection). Mirrors ResolvedDpaBlock.
@ObjectType('DpaDocumentBlock')
export class DpaDocumentBlockDTO {
  @Field(() => DpaDocumentBlockKind)
  kind: DpaDocumentBlockKind;

  @Field()
  text: string;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  value?: string;
}
