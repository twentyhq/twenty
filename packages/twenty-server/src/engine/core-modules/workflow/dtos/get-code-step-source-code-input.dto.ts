import { ID, InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class GetCodeStepSourceCodeInput {
  @IDField(() => ID, {
    description: 'The id of the logic function (code step).',
  })
  id!: string;
}
