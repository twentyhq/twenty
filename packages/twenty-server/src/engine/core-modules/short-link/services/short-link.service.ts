import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ShortLinkEntity } from 'src/engine/core-modules/short-link/short-link.entity';
import { hashShortLink } from 'src/engine/core-modules/short-link/utils/hash-short-link.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ShortLinkService {
  constructor(
    @InjectWorkspaceScopedRepository(ShortLinkEntity)
    private readonly shortLinkRepository: WorkspaceScopedRepository<ShortLinkEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ShortLinkEntity)
    private readonly globalShortLinkRepository: Repository<ShortLinkEntity>,
  ) {}

  async registerLinks({
    workspaceId,
    links,
  }: {
    workspaceId: string;
    links: { url: string; authoredUrl: string }[];
  }): Promise<Map<string, string>> {
    const linkHashes = links.map(hashShortLink);

    await this.shortLinkRepository
      .createQueryBuilder()
      .insert()
      .into(ShortLinkEntity)
      .values(
        links.map((link, index) => ({
          workspaceId,
          url: link.url,
          authoredUrl: link.authoredUrl,
          urlHash: linkHashes[index],
        })),
      )
      .orIgnore()
      .execute();

    const persistedLinks = await this.shortLinkRepository.find(workspaceId, {
      where: { urlHash: In(linkHashes) },
    });

    return new Map(persistedLinks.map((link) => [link.urlHash, link.id]));
  }

  async findByIdAcrossWorkspaces(
    shortLinkId: string,
  ): Promise<ShortLinkEntity | null> {
    return this.globalShortLinkRepository.findOne({
      where: { id: shortLinkId },
    });
  }
}
