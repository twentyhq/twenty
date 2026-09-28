import { Field, InputType } from '@nestjs/graphql';
import { isString } from '@sniptt/guards';
import { IsIn, ValidateBy } from 'class-validator';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';

@InputType()
export class UpdateWorkspaceAllowedIframeOriginsInput {
  @Field(() => String)
  @IsIn(['add', 'remove'])
  operation: 'add' | 'remove';

  @Field()
  @ValidateBy({
    name: 'allowedIframeOrigin',
    validator: {
      validate: (value: unknown) =>
        isString(value) && isDefined(normalizeAllowedIframeOrigin(value)),
      defaultMessage: () =>
        'Enter an HTTP or HTTPS origin without a path or wildcard',
    },
  })
  origin: string;
}
