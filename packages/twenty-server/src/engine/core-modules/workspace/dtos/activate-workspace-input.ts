import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ActivateWorkspaceInput {
  // The workspace name is set at creation (signUpInNewWorkspace). This field is
  // ignored during activation and kept only for backward compatibility.
  @Field({
    nullable: true,
    description:
      'Deprecated: the workspace name is set at creation (signUpInNewWorkspace) and this field is ignored during activation. Kept for backward compatibility.',
  })
  @IsString()
  @IsOptional()
  displayName?: string;
}
