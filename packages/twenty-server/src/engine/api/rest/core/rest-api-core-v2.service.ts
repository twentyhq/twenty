import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { capitalize } from 'twenty-shared/utils';

import { OrderByCondition } from 'typeorm';

import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult as formatGetManyData } from 'src/engine/twenty-orm/utils/format-result.util';

interface FormatResultParams<T> {
  operation: 'delete' | 'create' | 'update' | 'findOne' | 'findMany';
  objectNameSingular?: string;
  objectNamePlural?: string;
  data: T;
  meta?: any;
}
@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly limitInputFactory: LimitInputFactory,
    private readonly filterInputFactory: FilterInputFactory,
    private readonly featureFlagService: FeatureFlagService,
    private readonly orderByInputFactory: OrderByInputFactory,
    private readonly startingAfterInputFactory: StartingAfterInputFactory,
    private readonly endingBeforeInputFactory: EndingBeforeInputFactory,
  ) {}

  async delete(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
    });

    await repository.delete(recordId);

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadataNameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }

  async createOne(request: Request) {
    const { body } = request;

    const { objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const createdRecord = await repository.save(body);

    return this.formatResult({
      operation: 'create',
      objectNameSingular: objectMetadataNameSingular,
      data: createdRecord,
    });
  }

  async update(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const recordToUpdate = await repository.findOneOrFail({
      where: { id: recordId },
    });

    const updatedRecord = await repository.save({
      ...recordToUpdate,
      ...request.body,
    });

    return this.formatResult({
      operation: 'update',
      objectNameSingular: objectMetadataNameSingular,
      data: updatedRecord,
    });
  }

  async get(request: Request) {
    const { id: recordId } = parseCorePath(request);
    const {
      objectMetadataNameSingular,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      featureFlagsMap,
    } = await this.getRepositoryAndMetadataOrFail(request);

    if (recordId) {
      const record = await repository.findOne({
        where: { id: recordId },
      });

      return this.formatResult({
        operation: 'findOne',
        objectNameSingular: objectMetadataNameSingular,
        data: record,
      });
    } else {
      const limit = this.limitInputFactory.create(request);
      const filter = this.filterInputFactory.create(request, objectMetadata);
      const orderBy = this.orderByInputFactory.create(request, objectMetadata);
      // const endingBefore = this.endingBeforeInputFactory.create(request);
      // const startingAfter = this.startingAfterInputFactory.create(request);

      const fieldMetadataMapByName =
        objectMetadataItemWithFieldsMaps?.fieldsByName || {};

      const qb = repository.createQueryBuilder(objectMetadataNameSingular);

      const finalQuery = new GraphqlQueryFilterConditionParser(
        fieldMetadataMapByName,
        featureFlagsMap,
      ).parse(qb, objectMetadataNameSingular, filter);

      const parsedOrderBy = new GraphqlQueryOrderFieldParser(
        fieldMetadataMapByName,
        featureFlagsMap,
      ).parse(orderBy, objectMetadataNameSingular);

      const records = await finalQuery
        .orderBy(parsedOrderBy as OrderByCondition)
        .take(limit)
        .getMany();

      return this.formatResult({
        operation: 'findMany',
        objectNamePlural: objectMetadataNameSingular,
        data: formatGetManyData(
          records,
          objectMetadataItemWithFieldsMaps as any,
          objectMetadata.objectMetadataMaps,
        ),
      });
    }
  }

  private formatResult<T>({
    operation,
    objectNameSingular,
    objectNamePlural,
    data,
  }: FormatResultParams<T>) {
    let prefix;

    if (operation === 'findOne') {
      prefix = objectNameSingular || '';
    } else if (operation === 'findMany') {
      prefix = objectNamePlural || '';
    } else {
      prefix = operation + capitalize(objectNameSingular || '');
    }
    const result = {
      data: {
        [prefix]: data,
      },
    };

    return result;
  }

  private async getRepositoryAndMetadataOrFail(request: Request) {
    const { workspace } = request;
    const { object: parsedObject } = parseCorePath(request);

    const objectMetadata = await this.coreQueryBuilderFactory.getObjectMetadata(
      request,
      parsedObject,
    );

    if (!objectMetadata) {
      throw new BadRequestException('Object metadata not found');
    }

    if (!workspace?.id) {
      throw new BadRequestException('Workspace not found');
    }

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadata.objectMetadataMaps,
        objectMetadataNameSingular,
      );

    const featureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        objectMetadataNameSingular,
      );

    return {
      objectMetadataNameSingular,
      objectMetadata,
      repository,
      objectMetadataItemWithFieldsMaps,
      featureFlagsMap,
    };
  }
}
