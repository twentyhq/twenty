import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

@Resolver()
export class TestResolver {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => String)
  async test() {
    const repository = await this.twentyORMManager.getRepository(CalendarEventWorkspaceEntity);

    const res = await repository.find({
      where: {
        calendarChannelEventAssociations: [],
      },
      relations: [
        'calendarChannelEventAssociations',
      ]
    });

    console.log('RES: ', res);

    return 'Hello World!';
  }
}
