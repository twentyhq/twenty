import { Injectable } from '@nestjs/common';

import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql';
import {
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
          'Date granularity (e.g. day, month, quarter, year, week, day of the week, quarter of the year, month of the year)',
      }),
    );

    const dateGranularityEnum = this.gqlTypesStorage.getGqlTypeByKey(
      'DateGranularityEnum',
    ) as GraphQLEnumType;

    if (!isDefined(dateGranularityEnum)) {
      throw new Error('DateGranularityEnum not found');
    }

    const firstDayOfWeekEnum = new GraphQLEnumType({
      name: 'FirstDayOfTheWeek',
      values: Object.values(FirstDayOfTheWeek).reduce(
        (acc, option) => {
          acc[option] = { value: option };

          return acc;
        },
        {} as Record<string, { value: string }>,
      ),
      description: 'First day of the week (MONDAY, SUNDAY, SATURDAY)',
    });

    this.gqlTypesStorage.addGqlType('FirstDayOfTheWeek', firstDayOfWeekEnum);

    const groupByDateField = new GraphQLInputObjectType({
      name: GROUP_BY_DATE_GRANULARITY_INPUT_KEY,
      fields: {
        granularity: {
          type: dateGranularityEnum,
          description:
            'Date granularity (e.g. day, month, quarter, year, week, day of the week, quarter of the year, month of the year)',
        },
        weekStartDay: {
          type: firstDayOfWeekEnum,
          description:
            'First day of the week (only applicable when granularity is WEEK). Defaults to MONDAY if not specified.',
        },
        timeZone: {
          type: GraphQLString,
          description:
            'Timezone used to compute the aggregate value and in which is expressed the granular period, for example a day in UTC-12 is not the same period as a day in UTC+3, the requester needs to precise this otherwise the server will assume a timezone and the requester cannot know in which timezone the aggregate values are computed.',
        },
      },
    });

    this.gqlTypesStorage.addGqlType(
      GROUP_BY_DATE_GRANULARITY_INPUT_KEY,
      groupByDateField,
    );

    const orderByDateField = new GraphQLInputObjectType({
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
      orderByDateField,
    );
  }
}
