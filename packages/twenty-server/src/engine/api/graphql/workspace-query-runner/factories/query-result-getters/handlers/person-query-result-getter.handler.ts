import { buildSignedPath } from 'twenty-shared/utils';

import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { extractFileIdFromPath } from 'src/engine/core-modules/file/utils/extract-file-id-from-path.utils';

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

    const signedPayload = this.fileService.encodeFileToken({
      fileId: extractFileIdFromPath(person.avatarUrl),
      workspaceId,
    });

    return {
      ...person,
      avatarUrl: buildSignedPath({
        path: person.avatarUrl,
        token: signedPayload,
      }),
    };
  }
}
