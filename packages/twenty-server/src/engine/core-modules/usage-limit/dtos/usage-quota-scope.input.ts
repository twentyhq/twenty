import { InputType, OmitType } from '@nestjs/graphql';

import { CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';

@InputType()
export class UsageQuotaScopeInput extends OmitType(CreateUsageLimitInput, [
  'limitValue',
  'burstValue',
  'limitKind',
  'periodCount',
] as const) {}
