import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import graphqlTypeJson from 'graphql-type-json';
import { Repository } from 'typeorm';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { OutputSchema } from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';
import { isDefined } from 'src/utils/is-defined';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CodeIntrospectionService } from 'src/modules/code-introspection/code-introspection.service';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';
import { ComputeStepSettingOutputSchemaInput } from 'src/engine/core-modules/workflow/dtos/compute-step-setting-output-schema-input.dto';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeObjectRecordEvent } from 'src/engine/core-modules/event-emitter/utils/generate-fake-object-record-event';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseFilters(WorkflowTriggerGraphqlApiExceptionFilter)
export class WorkflowResolver {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly codeIntrospectionService: CodeIntrospectionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @Mutation(() => graphqlTypeJson)
  async computeStepSettingOutputSchema(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input') { step }: ComputeStepSettingOutputSchemaInput,
  ): Promise<OutputSchema> {
    const stepType = step.type;

    switch (stepType) {
      case WorkflowTriggerType.DATABASE_EVENT: {
        const [nameSingular, action] = step.settings.eventName.split('.');

        if (!['created', 'updated', 'deleted', 'destroyed'].includes(action)) {
          return {};
        }

        const objectMetadata =
          await this.objectMetadataRepository.findOneOrFail({
            where: {
              nameSingular,
              workspaceId,
            },
            relations: ['fields'],
          });

        if (!isDefined(objectMetadata)) {
          return {};
        }

        return generateFakeObjectRecordEvent(
          objectMetadata,
          action as 'created' | 'updated' | 'deleted' | 'destroyed',
        );
      }
      case WorkflowActionType.SEND_EMAIL: {
        return { success: true };
      }
      case WorkflowActionType.CODE: {
        const { serverlessFunctionId, serverlessFunctionVersion } =
          step.settings.input;

        if (serverlessFunctionId === '') {
          return {};
        }

        const sourceCode = (
          await this.serverlessFunctionService.getServerlessFunctionSourceCode(
            workspaceId,
            serverlessFunctionId,
            serverlessFunctionVersion,
          )
        )?.[join('src', INDEX_FILE_NAME)];

        if (!isDefined(sourceCode)) {
          return {};
        }

        const fakeFunctionInput =
          this.codeIntrospectionService.generateInputData(sourceCode);

        const resultFromFakeInput =
          await this.serverlessFunctionService.executeOneServerlessFunction(
            serverlessFunctionId,
            workspaceId,
            fakeFunctionInput,
            serverlessFunctionVersion,
          );

        return resultFromFakeInput.data ?? {};
      }
      default:
        throw new Error(`Unknown type ${stepType}`);
    }
  }
}
