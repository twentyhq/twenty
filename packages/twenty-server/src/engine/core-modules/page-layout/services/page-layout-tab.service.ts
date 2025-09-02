import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';

@Injectable()
export class PageLayoutTabService {
  constructor(
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
  ) {}

  async findByPageLayoutId(
    workspaceId: string,
    pageLayoutId: string,
  ): Promise<PageLayoutTabEntity[]> {
    return this.pageLayoutTabRepository.find({
      where: {
        pageLayoutId,
        pageLayout: { workspaceId },
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['widgets'],
    });
  }
}
