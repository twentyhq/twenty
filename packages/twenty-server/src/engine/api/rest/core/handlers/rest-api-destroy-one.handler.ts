import { BadRequestException, Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonDestroyOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-one-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';

@Injectable()
export class RestApiDestroyOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonDestroyOneQueryRunnerService: CommonDestroyOneQueryRunnerService,
  ) {
    super();
  }

  async commonHandle(request: AuthenticatedRequest) {
    try {
      const { id } = this.parseRequestArgs(request);

      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const record = await this.commonDestroyOneQueryRunnerService.execute(
        { id, selectedFields: { id: true } },
        {
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        },
        CommonQueryNames.DESTROY_ONE,
      );

      return this.formatRestResponse(
        record,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return { data: { [`delete${capitalize(objectNameSingular)}`]: record } };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const { id } = parseCorePath(request);

    if (!isDefined(id)) {
      throw new BadRequestException('Record ID not found');
    }

    return {
      id,
    };
  }

  async handle(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadata, repository, restrictedFields } =
      await this.getRepositoryAndMetadataOrFail(request);

    const selectOptions = getAllSelectableFields({
      restrictedFields,
      objectMetadata,
    });

    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
      select: selectOptions,
    });

    const columnsToReturnForDelete: string[] = [];

    await repository.delete(recordId, undefined, columnsToReturnForDelete);

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }
}
