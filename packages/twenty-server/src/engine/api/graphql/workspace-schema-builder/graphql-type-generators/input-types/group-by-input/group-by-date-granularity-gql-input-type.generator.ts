import { Injectable } from '@nestjs/common';

import { GraphQLEnumType, GraphQLInputObjectType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordGroupByDateGranularity } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { OrderByDirectionType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/enum';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

export const GROUP_BY_DATE_GRANULARITY_INPUT_KEY =
  'GroupByDateGranularityInput';
export const ORDER_BY_DATE_GRANULARITY_INPUT_KEY =
  'OrderByDateGranularityInput';

@Injectable()
export class GroupByDateGranularityInputTypeGenerator {
  constructor(private readonly gqlTypesStorage: GqlTypesStorage) {}

  public buildAndStore() {
    this.gqlTypesStorage.addGqlType(
      'DateGranularityEnum',
      new GraphQLEnumType({
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
    );

    const dateGranularityEnum = this.gqlTypesStorage.getGqlTypeByKey(
      'DateGranularityEnum',
    ) as GraphQLEnumType;

    if (!isDefined(dateGranularityEnum)) {
      throw new Error('DateGranularityEnum not found');
    }

    const groupByDateField = new GraphQLInputObjectType({
      name: GROUP_BY_DATE_GRANULARITY_INPUT_KEY,
      fields: {
        granularity: {
          type: dateGranularityEnum,
          description:
            'Date granularity (e.g. day, month, quarter, year, day of the week, quarter of the year, month of the year)',
        },
      },
    });

    this.gqlTypesStorage.addGqlType(
      GROUP_BY_DATE_GRANULARITY_INPUT_KEY,
      groupByDateField,
    );

    const orderByDateFieldForGroupBy = new GraphQLInputObjectType({
      name: ORDER_BY_DATE_GRANULARITY_INPUT_KEY,
      fields: {
        orderBy: {
          type: OrderByDirectionType,
        },
        granularity: {
          type: dateGranularityEnum,
        },
      },
    });

    this.gqlTypesStorage.addGqlType(
      ORDER_BY_DATE_GRANULARITY_INPUT_KEY,
      orderByDateFieldForGroupBy,
    );
  }
}
