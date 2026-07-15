import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { ApplicationRegistrationListingReviewDecision } from 'src/engine/core-modules/application/application-registration/enums/application-registration-listing-review-decision.enum';

@ArgsType()
export class ReviewApplicationRegistrationListingInput {
  @Field(() => String)
  @IsUUID()
  applicationRegistrationId: string;

  @Field(() => ApplicationRegistrationListingReviewDecision)
  @IsEnum(ApplicationRegistrationListingReviewDecision)
  decision: ApplicationRegistrationListingReviewDecision;

  // Free-text explanation emailed to the requester's contact email on
  // rejection or change request.
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
