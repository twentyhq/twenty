import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity';
import { CalendarStartDay } from 'twenty-shared';
import {
  type FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export type GroupByFieldObject = Record<
  string,
  boolean | Record<string, boolean | string | Record<string, boolean | string>>
>;

export const buildGroupByFieldObject = ({
  field,
  subFieldName,
  dateGranularity,
  firstDayOfTheWeek,
  isNestedDateField,
}: {
  field: FieldMetadataItem;
  subFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  firstDayOfTheWeek?: number | null;
  isNestedDateField?: boolean;
}): GroupByFieldObject => {
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

    if (isNestedDateField === true || isDefined(dateGranularity)) {
      return {
        [field.name]: {
          [nestedFieldName]: {
            granularity: dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
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
    const granularity = dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY;
    const result: Record<string, string> = { granularity };

    if (
      granularity === ObjectRecordGroupByDateGranularity.WEEK &&
      isDefined(firstDayOfTheWeek) &&
      firstDayOfTheWeek !== CalendarStartDay.SYSTEM
    ) {
      const weekStartDay = CalendarStartDay[
        firstDayOfTheWeek
      ] as FirstDayOfTheWeek;

      result.weekStartDay = weekStartDay;
    }

    return { [field.name]: result };
  }

  return { [field.name]: true };
};
