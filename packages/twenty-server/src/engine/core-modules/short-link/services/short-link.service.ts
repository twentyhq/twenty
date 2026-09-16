import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'node:crypto';

import chunk from 'lodash.chunk';
import { In, Repository } from 'typeorm';

import { ShortLinkEntity } from 'src/engine/core-modules/short-link/short-link.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ShortLinkToRegister = { url: string; authoredUrl: string };

const FIND_BY_IDS_CHUNK_SIZE = 5000;

@Injectable()
export class ShortLinkService {
  constructor(
    @InjectWorkspaceScopedRepository(ShortLinkEntity)
    private readonly shortLinkRepository: WorkspaceScopedRepository<ShortLinkEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ShortLinkEntity)
    private readonly globalShortLinkRepository: Repository<ShortLinkEntity>,
  ) {}

  async registerCampaignLinks({
    workspaceId,
    messageCampaignId,
    links,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    links: ShortLinkToRegister[];
  }): Promise<Map<string, string>> {
    const urlHashes = links.map((link) => this.hashUrl(link.url));

    await this.shortLinkRepository
      .createQueryBuilder()
      .insert()
      .into(ShortLinkEntity)
      .values(
        links.map((link, index) => ({
          workspaceId,
          messageCampaignId,
          url: link.url,
          authoredUrl: link.authoredUrl,
          urlHash: urlHashes[index],
        })),
      )
      .orIgnore()
      .execute();

    const persistedLinks = await this.shortLinkRepository.find(workspaceId, {
      where: { messageCampaignId, urlHash: In(urlHashes) },
    });

    return new Map(persistedLinks.map((link) => [link.url, link.id]));
  }

  async findByIdAcrossWorkspaces(
    shortLinkId: string,
  ): Promise<ShortLinkEntity | null> {
    return this.globalShortLinkRepository.findOne({
      where: { id: shortLinkId },
    });
  }

  private hashUrl(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }
}
