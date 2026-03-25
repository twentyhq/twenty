import { isNonEmptyString } from '@sniptt/guards';
import {
  GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE,
  IANA_TIME_ZONES,
} from 'twenty-shared/constants';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { isGroupByDateField } from 'src/engine/api/common/common-query-runners/utils/is-group-by-date-field.util';
import { isGroupByRelationField } from 'src/engine/api/common/common-query-runners/utils/is-group-by-relation-field.util';

const VALID_IANA_TIMEZONES = new Set(IANA_TIME_ZONES);

export const getGroupByExpression = ({
  groupByField,
  columnNameWithQuotes,
}: {
  groupByField: GroupByField;
  columnNameWithQuotes: string;
}) => {
  if (
    !(isGroupByDateField(groupByField) || isGroupByRelationField(groupByField))
  ) {
    if ('shouldUnnest' in groupByField && groupByField.shouldUnnest) {
      return `UNNEST(CASE WHEN CARDINALITY(${columnNameWithQuotes}) > 0 THEN ${columnNameWithQuotes} ELSE ARRAY[${columnNameWithQuotes}[1]] END)`;
    }

    return columnNameWithQuotes;
  }

  const dateGranularity = groupByField.dateGranularity;

  if (!isDefined(dateGranularity)) {
    return columnNameWithQuotes;
  }

  const shouldUseTimeZone =
    GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE.includes(
      dateGranularity,
    ) && groupByField.fieldMetadata.type === FieldMetadataType.DATE_TIME;

  const timeZoneIsNotProvided = !isNonEmptyString(groupByField.timeZone);

  if (shouldUseTimeZone && timeZoneIsNotProvided) {
    throw new CommonQueryRunnerException(
      'Time zone should be specified for a group by date on Day, Week, Month, Quarter or Year',
      CommonQueryRunnerExceptionCode.MISSING_TIMEZONE_FOR_DATE_GROUP_BY,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    shouldUseTimeZone &&
    !timeZoneIsNotProvided &&
    !VALID_IANA_TIMEZONES.has(groupByField.timeZone!)
  ) {
    throw new CommonQueryRunnerException(
      `Invalid timezone: ${groupByField.timeZone}`,
      CommonQueryRunnerExceptionCode.INVALID_TIMEZONE,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const timeZoneAsDateTruncParameter = shouldUseTimeZone
    ? `, '${groupByField.timeZone}'`
    : '';

  const timeZoneAsToCharParameter = shouldUseTimeZone
    ? ` AT TIME ZONE '${groupByField.timeZone}'`
    : '';

  switch (dateGranularity) {
    case ObjectRecordGroupByDateGranularity.NONE:
      return columnNameWithQuotes;
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMDay'))`;
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, 'TMMonth'))`;
    case ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR:
      return `TRIM(TO_CHAR(${columnNameWithQuotes}, '"Q"Q'))`;
    case ObjectRecordGroupByDateGranularity.WEEK: {
      const weekStartDay = groupByField.weekStartDay;
      let shiftedExpression = `DATE_TRUNC('week', ${columnNameWithQuotes}${timeZoneAsDateTruncParameter})`;

      if (isDefined(weekStartDay)) {
        if (weekStartDay === 'SUNDAY') {
          shiftedExpression = `(DATE_TRUNC('week', ${columnNameWithQuotes} + INTERVAL '1 day'${timeZoneAsDateTruncParameter}) - INTERVAL '1 day')`;
        } else if (weekStartDay === 'SATURDAY') {
          shiftedExpression = `(DATE_TRUNC('week', ${columnNameWithQuotes} + INTERVAL '2 days'${timeZoneAsDateTruncParameter}) - INTERVAL '2 days')`;
        }
      }

      return `TO_CHAR(${shiftedExpression}${timeZoneAsToCharParameter}, 'YYYY-MM-DD')`;
    }
    case ObjectRecordGroupByDateGranularity.DAY:
    case ObjectRecordGroupByDateGranularity.MONTH:
    case ObjectRecordGroupByDateGranularity.QUARTER:
    case ObjectRecordGroupByDateGranularity.YEAR:
      return `TO_CHAR(DATE_TRUNC('${dateGranularity}', ${columnNameWithQuotes}${timeZoneAsDateTruncParameter})${timeZoneAsToCharParameter}, 'YYYY-MM-DD')`;
    default:
      assertUnreachable(dateGranularity);
  }
};
