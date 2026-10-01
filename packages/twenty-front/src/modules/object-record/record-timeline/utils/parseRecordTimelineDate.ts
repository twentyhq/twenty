import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const parseRecordTimelineDate = ({
  value,
  fieldType,
  timeZone,
}: {
  value: unknown;
  fieldType: FieldMetadataType;
  timeZone: string;
}): Temporal.PlainDate | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  try {
    return fieldType === FieldMetadataType.DATE
      ? Temporal.PlainDate.from(value)
      : Temporal.Instant.from(value).toZonedDateTimeISO(timeZone).toPlainDate();
  } catch {
    return undefined;
  }
};
