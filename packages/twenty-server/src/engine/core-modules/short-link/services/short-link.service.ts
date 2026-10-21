import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { hashShortLink } from 'src/engine/core-modules/short-link/utils/hash-short-link.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ShortLinkWorkspaceEntity } from 'src/modules/emailing/standard-objects/short-link.workspace-entity';

@Injectable()
export class ShortLinkService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async registerLinks({
    workspaceId,
    links,
  }: {
    workspaceId: string;
    links: {
      authoredTemplateUrl: string;
      resolvedDestinationUrl: string;
    }[];
  }): Promise<Map<string, string>> {
    const linkHashes = links.map(hashShortLink);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = this.workspaceOrmManager.getRepository(
        ShortLinkWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );

      await repository.insert(
        links.map((link, index) => ({
          ...link,
          templateAndResolvedUrlHash: linkHashes[index],
        })),
        { onConflictDoNothing: true },
      );

      const persistedLinks = await repository.find({
        where: { templateAndResolvedUrlHash: In(linkHashes) },
      });

      return new Map(
        persistedLinks.map((link) => [
          link.templateAndResolvedUrlHash,
          link.id,
        ]),
      );
    }, buildSystemAuthContext(workspaceId));
  }

  async findById({
    workspaceId,
    shortLinkId,
  }: {
    workspaceId: string;
    shortLinkId: string;
  }): Promise<ShortLinkWorkspaceEntity | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(ShortLinkWorkspaceEntity, {
            shouldBypassPermissionChecks: true,
          })
          .findOne({ where: { id: shortLinkId } }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
