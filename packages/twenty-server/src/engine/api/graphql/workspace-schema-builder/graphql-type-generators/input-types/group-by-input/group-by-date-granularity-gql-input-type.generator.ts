import { Injectable } from '@nestjs/common';

import { GraphQLEnumType, GraphQLInputObjectType } from 'graphql';

import { ObjectRecordGroupByDateGranularity } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

export const GROUP_BY_DATE_GRANULARITY_INPUT_KEY = 'GroupByDateInput';

@Injectable()
export class GroupByDateGranularityInputTypeGenerator {
  constructor(private readonly gqlTypesStorage: GqlTypesStorage) {}

  public buildAndStore() {
    const key = GROUP_BY_DATE_GRANULARITY_INPUT_KEY;
    const type = new GraphQLInputObjectType({
      name: GROUP_BY_DATE_GRANULARITY_INPUT_KEY,
      fields: {
        granularity: {
          type: new GraphQLEnumType({
            name: 'DateGranularityEnum',
            values: Object.entries(ObjectRecordGroupByDateGranularity).reduce(
              (acc, [key, value]) => {
                acc[key] = { value };

                return acc;
              },
              {} as Record<string, { value: string }>,
            ),
            description:
              'Date granularity (e.g. day, month, quarter, year, day of the week, quarter of the year, month of the year)',
          }),
          description:
            'Date granularity (e.g. day, month, quarter, year, day of the week, quarter of the year, month of the year)',
        },
      },
    });

    this.gqlTypesStorage.addGqlType(key, type);
  }
}
