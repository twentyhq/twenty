import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import {
  CalendarStartDay,
  GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE,
} from 'twenty-shared/constants';
import {
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';

const GRAPH_DEFAULT_DATE_GRANULARITY = ObjectRecordGroupByDateGranularity.DAY;

export type GroupByFieldObject = Record<
  string,
  boolean | Record<string, boolean | string | Record<string, boolean | string>>
>;

type BuildGroupByFieldObjectParams = {
  field: FieldMetadataItem;
  subFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  firstDayOfTheWeek?: CalendarStartDay | null;
  isNestedDateField?: boolean;
  timeZone?: string;
};

export const buildGroupByFieldObject = ({
  field,
  subFieldName,
  dateGranularity,
  firstDayOfTheWeek,
  isNestedDateField,
  timeZone,
}: BuildGroupByFieldObjectParams): GroupByFieldObject => {
  const isRelation = isFieldRelation(field) || isFieldMorphRelation(field);
  const isComposite = isCompositeFieldType(field.type);
  const isDateField = isFieldMetadataDateKind(field.type);

  if (isRelation) {
    if (!isDefined(subFieldName)) {
      return { [`${field.name}Id`]: true };
    }

    const parts = subFieldName.split('.');
    const nestedFieldName = parts[0];
    const nestedSubFieldName = parts[1];

    if (isNestedDateField === true) {
      const usedDateGranularity =
        dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY;

      const shouldHaveTimeZone =
        GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE.includes(
          usedDateGranularity,
        );

      const timeZoneIsNotProvided = !isDefined(timeZone);

      if (shouldHaveTimeZone) {
        if (timeZoneIsNotProvided) {
          throw new Error(`Date order by should have a time zone.`);
        } else {
          return {
            [field.name]: {
              [nestedFieldName]: {
                granularity: usedDateGranularity,
                timeZone,
              },
            },
          };
        }
      }

      return {
        [field.name]: {
          [nestedFieldName]: {
            granularity: usedDateGranularity,
          },
        },
      };
    }

    if (isDefined(nestedSubFieldName)) {
      return {
        [field.name]: {
          [nestedFieldName]: {
            [nestedSubFieldName]: true,
          },
        },
      };
    }

    return {
      [field.name]: {
        [nestedFieldName]: true,
      },
    };
  }

  if (isComposite) {
    if (!isDefined(subFieldName)) {
      throw new Error(
        `Composite field ${field.name} requires a subfield to be specified`,
      );
    }

    return {
      [field.name]: {
        [subFieldName]: true,
      },
    };
  }

  if (isDateField) {
    const usedDateGranularity =
      dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY;

    const shouldHaveTimeZone =
      GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE.includes(
        usedDateGranularity,
      );

    const timeZoneIsNotProvided = !isDefined(timeZone);

    const result: Record<string, string> = { granularity: usedDateGranularity };

    if (shouldHaveTimeZone) {
      if (timeZoneIsNotProvided) {
        throw new Error(`Date order by should have a time zone.`);
      } else {
        result.timeZone = timeZone;
      }
    }

    if (
      usedDateGranularity === ObjectRecordGroupByDateGranularity.WEEK &&
      isDefined(firstDayOfTheWeek) &&
      firstDayOfTheWeek !== CalendarStartDay.SYSTEM
    ) {
      const weekStartDay =
        convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
          firstDayOfTheWeek,
          FirstDayOfTheWeek.MONDAY,
        );

      result.weekStartDay = weekStartDay;
    }

    return { [field.name]: result };
  }

  return { [field.name]: true };
};
