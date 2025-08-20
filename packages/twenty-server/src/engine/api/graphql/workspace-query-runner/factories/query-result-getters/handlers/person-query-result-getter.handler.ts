import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export class PersonQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    person: PersonWorkspaceEntity,
    workspaceId: string,
  ): Promise<PersonWorkspaceEntity> {
    if (!person.id || !person?.avatarUrl) {
      return person;
    }

    const signedPath = this.fileService.signFileUrl({
      url: person.avatarUrl,
      workspaceId,
    });

    return {
      ...person,
      avatarUrl: signedPath,
    };
  }
}
