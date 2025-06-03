import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { CreateOnboardingPlansInput } from 'src/engine/core-modules/onboarding-plans/dtos/onboarding-plans.input';
import { UpdateOnboardingPlansInput } from 'src/engine/core-modules/onboarding-plans/dtos/update-onboarding-plans.input';

import { OnboardingPlansService } from './onboarding-plans.service';

@Controller('onboarding-plans')
@UseFilters(RestApiExceptionFilter)
export class OnboardingPlansController {
  constructor(private readonly service: OnboardingPlansService) {}

  @Post()
  create(@Body() dto: CreateOnboardingPlansInput) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOnboardingPlansInput) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
