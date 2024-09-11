import { Injectable } from '@nestjs/common';

import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  FindManyResolverArgs,
  FindOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ObjectLiteral } from 'typeorm';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @LogExecutionTime()
  async findOne<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord | undefined> {
    const graphqlQueryFindOneResolverService =
      new GraphqlQueryFindOneResolverService(this.twentyORMGlobalManager);

    return graphqlQueryFindOneResolverService.findOne(args, options);
  }

  @LogExecutionTime()
  async findMany<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const graphqlQueryFindManyResolverService =
      new GraphqlQueryFindManyResolverService(this.twentyORMGlobalManager);

    return graphqlQueryFindManyResolverService.findMany(args, options);
  }

  async searchPerson(
    repository: WorkspaceRepository<ObjectLiteral>,
    select: Record<string, any>,
    searchTerm: string,
  ) {
    const selectedFieldsWithoutRelations =
      this.getSelectedFieldsWithoutRelations(select);

    const getResultsWithTrigram = false;

    if (getResultsWithTrigram) {
      const similarityThreshold = 0.2;
      const resultsWithTrigram = await repository
        .createQueryBuilder()
        .select(selectedFieldsWithoutRelations)
        .where('similarity("nameLastName", :searchTerm) > :threshold', {
          searchTerm,
          threshold: similarityThreshold,
        })
        .orWhere('similarity("nameFirstName", :searchTerm) > :threshold', {
          searchTerm,
          threshold: similarityThreshold,
        })

        .orWhere('email % :searchTerm', { searchTerm })
        .orWhere('phone % :searchTerm', { searchTerm })
        .orWhere('"jobTitle" % :searchTerm', { searchTerm })
        .orderBy(
          '(similarity("nameFirstName", :searchTerm) + similarity("nameLastName", :searchTerm))',
          'DESC',
        )
        .setParameter('searchTerm', searchTerm)
        .execute();

      return resultsWithTrigram;
    } else {
      const searchTerms = this.formatSearchTerms(searchTerm);

      const resultsWithTsVector = await repository
        .createQueryBuilder()
        .select(selectedFieldsWithoutRelations)
        .where('search_vector @@ to_tsquery(:searchTerms)', {
          searchTerms,
        })
        .orderBy('ts_rank(search_vector, to_tsquery(:searchTerms))', 'DESC')
        .setParameter('searchTerms', searchTerms)
        .execute();

      return resultsWithTsVector;
    }
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

  private formatSearchTerms(searchTerm: string) {
    // Diviser la chaîne d'entrée en mots en utilisant les espaces comme séparateurs
    const words = searchTerm.trim().split(/\s+/);

    // Transformer chaque mot pour le mettre au format souhaité
    const formattedWords = words.map((word) => `${word}:*`);

    // Joindre les mots formatés avec " | "
    const result = formattedWords.join(' | ');

    return result;
  }
}
