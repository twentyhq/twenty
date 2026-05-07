import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { AppLogicFunctionService } from 'src/engine/core-modules/logic-function/app-logic-function/app-logic-function.service';
import { EnqueueLogicFunctionExecutionDto } from 'src/engine/core-modules/logic-function/app-logic-function/dtos/enqueue-logic-function-execution.dto';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('app/logic-functions')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class AppLogicFunctionController {
  constructor(
    private readonly appLogicFunctionService: AppLogicFunctionService,
  ) {}

  @Post('enqueue')
  @HttpCode(HttpStatus.ACCEPTED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async enqueue(
    @Req() request: Request,
    @Body() body: EnqueueLogicFunctionExecutionDto,
  ) {
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'Logic function enqueue requires an APPLICATION_ACCESS token.',
      );
    }

    return this.appLogicFunctionService.enqueueExecution({
      workspaceId: request.workspace.id,
      applicationId: request.application.id,
      dto: body,
    });
  }
}
