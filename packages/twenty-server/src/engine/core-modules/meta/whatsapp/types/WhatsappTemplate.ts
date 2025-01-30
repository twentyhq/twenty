import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class Component {
  @Field()
  type: string;

  @Field({ nullable: true })
  format?: string;

  @Field({ nullable: true })
  text?: string;
}

@ObjectType()
export class Template {
  @Field()
  name: string;

  @Field()
  parameter_format: string;

  @Field(() => [Component])
  components: Component[];

  @Field()
  language: string;

  @Field()
  status: string;

  @Field()
  category: string;

  @Field()
  id: string;
}

@ObjectType()
export class WhatsappTemplatesResponse {
  @Field(() => [Template])
  templates: Template[];
}
