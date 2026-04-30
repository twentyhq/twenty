import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LMSService } from './lms.service';

// --- DTOs ---
@ObjectType()
class LMSCourseDTO {
  @Field() id: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Int, { nullable: true }) estimatedMinutes?: number;
  @Field(() => Int, { nullable: true }) enrollmentCount?: number;
}

@ObjectType()
class LMSEnrollmentDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float, { nullable: true }) progressPercent?: number;
  @Field(() => Int, { nullable: true }) quizScore?: number;
  @Field(() => Int, { nullable: true }) timeSpentMinutes?: number;
}

@ObjectType()
class TrainingROIDTO {
  @Field(() => Int) totalEnrollments: number;
  @Field(() => Int) completionRate: number;
  @Field(() => Int) avgScore: number;
}

@InputType()
class CreateCourseInput {
  @Field() title: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) category?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class LMSResolver {
  constructor(private readonly service: LMSService) {}

  @Mutation(() => LMSCourseDTO)
  async createCourse(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateCourseInput,
  ) {
    return this.service.createCourse(workspace.id, input);
  }

  @Mutation(() => LMSEnrollmentDTO)
  async enrollUser(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('courseId') courseId: string,
    @Args('userId') userId: string,
  ) {
    return this.service.enrollUser(courseId, userId);
  }

  @Mutation(() => LMSEnrollmentDTO)
  async updateLMSProgress(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('enrollmentId') enrollmentId: string,
    @Args('moduleIndex', { type: () => Int }) moduleIndex: number,
    @Args('lessonIndex', { type: () => Int }) lessonIndex: number,
    @Args('timeSpent', { type: () => Int }) timeSpent: number,
  ) {
    return this.service.updateProgress(enrollmentId, moduleIndex, lessonIndex, timeSpent);
  }

  @Mutation(() => LMSEnrollmentDTO)
  async submitQuiz(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('enrollmentId') enrollmentId: string,
    @Args('score', { type: () => Int }) score: number,
  ) {
    return this.service.submitQuiz(enrollmentId, score);
  }

  @Query(() => TrainingROIDTO)
  async getTrainingROI(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getTrainingROI(workspace.id);
  }
}
