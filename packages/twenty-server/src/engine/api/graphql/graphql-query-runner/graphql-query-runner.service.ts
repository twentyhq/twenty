import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { FindManyOptions, ObjectLiteral } from 'typeorm';

import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionMapper } from 'src/engine/api/graphql/graphql-query-runner/orm-mappers/object-records-to-graphql-connection.mapper';
import { applyRangeFilter } from 'src/engine/api/graphql/graphql-query-runner/utils/apply-range-filter.util';
import { convertObjectMetadataToMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import { decodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @LogExecutionTime()
  async findManyWithTwentyOrm<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataItem, info, objectMetadataCollection } =
      options;

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const selectedFields = graphqlFields(info);

    const objectMetadataMap = convertObjectMetadataToMap(
      objectMetadataCollection,
    );

    const objectMetadata = objectMetadataMap[objectMetadataItem.nameSingular];

    if (!objectMetadata) {
      throw new Error(
        `Object metadata for ${objectMetadataItem.nameSingular} not found`,
      );
    }

    const fieldMetadataMap = objectMetadata.fields;

    const graphqlQueryParser = new GraphqlQueryParser(
      fieldMetadataMap,
      objectMetadataMap,
    );

    const { select, relations } = graphqlQueryParser.parseSelectedFields(
      objectMetadataItem,
      selectedFields,
    );

    const order = args.orderBy
      ? graphqlQueryParser.parseOrder(args.orderBy)
      : undefined;

    const where = args.filter
      ? graphqlQueryParser.parseFilter(args.filter)
      : {};

    let cursor: Record<string, any> | undefined;

    if (args.after) {
      cursor = decodeCursor(args.after);
    } else if (args.before) {
      cursor = decodeCursor(args.before);
    }

    if (args.first && args.last) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both first and last',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }

    const take = args.first ?? args.last ?? QUERY_MAX_RECORDS;

    const findOptions: FindManyOptions<ObjectLiteral> = {
      where,
      order,
      select,
      relations,
      take,
    };

    const totalCount = await repository.count({
      where,
    });

    if (cursor) {
      applyRangeFilter(where, order, cursor);
    }

    let objectRecords: ObjectLiteral[] = [];

    // if (objectMetadataItem.standardId === STANDARD_OBJECT_IDS.person) {
    if (args.filter?.search) {
      if (objectMetadataItem.standardId !== STANDARD_OBJECT_IDS.person) {
        throw new GraphqlQueryRunnerException(
          'Search is only supported for Person object',
          GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR,
        );
      }
      const rawObjectRecords = await this.searchPerson(
        repository,
        select,
        'design',
      );

      objectRecords = await repository.formatResult(rawObjectRecords);
    } else {
      if (objectMetadataItem.standardId === STANDARD_OBJECT_IDS.person) {
        console.log('stop');
      }
      objectRecords = await repository.find(findOptions);
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    const a = typeORMObjectRecordsParser.createConnection(
      (objectRecords as ObjectRecord[]) ?? [],
      take,
      totalCount,
      order,
      objectMetadataItem.nameSingular,
    );

    return a;
  }

  async searchPerson(
    repository: WorkspaceRepository<ObjectLiteral>,
    select: Record<string, any>,
    searchTerm: string,
  ) {
    const selectedFieldsWithoutRelations =
      this.getSelectedFieldsWithoutRelations(select);

    const results = await repository
      .createQueryBuilder()
      .select(selectedFieldsWithoutRelations)
      .where('"nameLastName" % :searchTerm', { searchTerm })
      .orWhere('"nameFirstName" % :searchTerm', { searchTerm })
      .orWhere('email % :searchTerm', { searchTerm })
      .orWhere('phone % :searchTerm', { searchTerm })
      .orWhere('"searchVector" @@ to_tsquery(:searchTermWithSuffix)')
      .orderBy('similarity("nameFirstName", :searchTerm)', 'DESC')
      .addOrderBy('similarity("nameLastName", :searchTerm)', 'DESC')
      .addOrderBy('similarity(email, :searchTerm)', 'DESC')
      .addOrderBy('similarity(phone, :searchTerm)', 'DESC')
      .addOrderBy(
        `ts_rank("searchVector", to_tsquery('simple', :searchTermWithSuffix))`,
        'DESC',
      )
      .setParameter('searchTerm', searchTerm)
      .setParameter('searchTermWithSuffix', `${searchTerm}:*`)
      .execute();

    //       SELECT *,
    //       ts_rank("searchVector", to_tsquery('simple', 'Eléonor:* | H:*')) AS rank
    // FROM person
    // WHERE "searchVector" @@ to_tsquery('simple', 'Eléonor:* | H:*')
    // ORDER BY rank DESC;

    return results;
  }

  private getSelectedFieldsWithoutRelations(select: Record<string, any>) {
    const selectForQueryBuilder: string[] = [];

    Object.keys(select).forEach((key) => {
      if (select[key] === true) {
        selectForQueryBuilder.push(`"${key}"`);
      }
    });

    return selectForQueryBuilder;
  }
}
