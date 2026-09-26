import { useContext } from 'react';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  formatFieldValueAsPlainText,
  type FieldValuePlainTextFormatters,
} from '@/object-record/record-field/ui/utils/formatFieldValueAsPlainText';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

export const useFormatFieldValueAsPlainText = () => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { formatNumber } = useNumberFormat();
  const { objectMetadataItems } = useObjectMetadataItems();

  const formatters: FieldValuePlainTextFormatters = {
    formatNumber,
    formatDate: (value, dateFieldSettings) =>
      formatDateString({
        value,
        // Date fields are stored as yyyy-mm-dd and parsed as UTC
        timeZone: 'UTC',
        dateFormat,
        dateFieldSettings,
        localeCatalog: dateLocale.localeCatalog,
      }),
    formatDateTime: (value, dateFieldSettings) =>
      formatDateTimeString({
        value,
        timeZone,
        dateFormat,
        timeFormat,
        dateFieldSettings,
        localeCatalog: dateLocale.localeCatalog,
      }),
    getRecordLabel: (record: ObjectRecord, objectNameSingular: string) => {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectNameSingular,
      );

      return getLabelIdentifierFieldValue(
        record,
        isDefined(objectMetadataItem)
          ? getLabelIdentifierFieldMetadataItem(objectMetadataItem)
          : undefined,
      ).trim();
    },
  };

  const formatFieldValue = (
    fieldDefinition: FieldDefinition<FieldMetadata>,
    fieldValue: unknown,
  ) => formatFieldValueAsPlainText({ fieldDefinition, fieldValue, formatters });

  return { formatFieldValueAsPlainText: formatFieldValue };
};
