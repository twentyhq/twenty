import { Field, InputType } from '@nestjs/graphql';
import { isString } from '@sniptt/guards';
import { IsIn, ValidateBy } from 'class-validator';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';

@InputType()
export class UpdateWorkspaceAllowedEmbeddingOriginsInput {
  @Field(() => String)
  @IsIn(['add', 'remove'])
  operation: 'add' | 'remove';

  @Field()
  @ValidateBy({
    name: 'allowedEmbeddingOrigin',
    validator: {
      validate: (value: unknown) =>
        isString(value) && isDefined(normalizeIframeOrigin(value)),
      defaultMessage: () =>
        'Enter an HTTP or HTTPS origin without a path or wildcard',
    },
  })
  origin: string;
}
