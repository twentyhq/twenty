import { FieldLinksValue } from '@/object-record/record-field/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getFieldLinkDefinedLinks = (fieldValue: FieldLinksValue) => {
  return [
    isNonEmptyString(fieldValue.primaryLinkUrl)
      ? {
          url: fieldValue.primaryLinkUrl,
          label: fieldValue.primaryLinkLabel,
        }
      : null,
    ...(fieldValue.secondaryLinks ?? []),
  ]
    .filter(isDefined)
    .map((link) => {
      if (!isNonEmptyString(link.url)) {
        return undefined;
      }

      return {
        url: link.url,
        label: link.label,
      };
    })
    .filter(isDefined);
};
