import { type Temporal } from 'temporal-polyfill';
import { ViewFilterOperand } from 'twenty-shared/types';

import { FieldMetadataType } from '~/generated-metadata/graphql';

type ChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

export const buildDateFilterForDayGranularity = (
  parsedDateTime: Temporal.ZonedDateTime,
  fieldType: FieldMetadataType,
  fieldName: string,
): ChartFilter[] => {
  if (fieldType === FieldMetadataType.DATE) {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS,
        value: parsedDateTime.toPlainDate().toString(),
      },
    ];
  }

  if (fieldType === FieldMetadataType.DATE_TIME) {
    const startOfDayDate = parsedDateTime.startOfDay();
    const endOfDayDate = parsedDateTime.add({ days: 1 });

    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_AFTER,
        value: startOfDayDate.toString({ timeZoneName: 'never' }),
      },
      {
        fieldName,
        operand: ViewFilterOperand.IS_BEFORE,
        value: endOfDayDate.toString({ timeZoneName: 'never' }),
      },
    ];
  }

  return [];
};
