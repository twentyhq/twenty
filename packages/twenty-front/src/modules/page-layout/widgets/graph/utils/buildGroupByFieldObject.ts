import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import { CalendarStartDay } from 'twenty-shared';
import {
  type FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataType } from '~/generated-metadata/graphql';

export const buildGroupByFieldObject = ({
  field,
  subFieldName,
  dateGranularity,
  firstDayOfTheWeek,
}: {
  field: FieldMetadataItem;
  subFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  firstDayOfTheWeek?: number | null;
}): Record<string, boolean | Record<string, boolean | string>> => {
  const isRelation = isFieldRelation(field) || isFieldMorphRelation(field);
  const isComposite = isCompositeFieldType(field.type);
  const isDateField =
    field.type === FieldMetadataType.DATE ||
    field.type === FieldMetadataType.DATE_TIME;

  if (isRelation) {
    return { [`${field.name}Id`]: true };
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
