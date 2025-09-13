import uniqBy from 'lodash.uniqby';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import {
  type LinkMetadata,
  type LinksMetadata,
} from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

import { parseArrayOrJsonStringToArray } from './parse-additional-items.util';

export const mergeLinksFieldValues = (
  recordsWithValues: { value: LinksMetadata; recordId: string }[],
  priorityRecordId: string,
): LinksMetadata => {
  if (recordsWithValues.length === 0) {
    return {
      primaryLinkUrl: '',
      primaryLinkLabel: '',
      secondaryLinks: null,
    };
  }

  let primaryLinkUrl = '';
  let primaryLinkLabel = '';

  const priorityRecord = recordsWithValues.find(
    (record) => record.recordId === priorityRecordId,
  );

  if (
    priorityRecord &&
    hasRecordFieldValue(priorityRecord.value.primaryLinkUrl)
  ) {
    primaryLinkUrl = priorityRecord.value.primaryLinkUrl;
    primaryLinkLabel = priorityRecord.value.primaryLinkLabel;
  } else {
    const fallbackRecord = recordsWithValues.find((record) =>
      hasRecordFieldValue(record.value.primaryLinkUrl),
    );

    if (fallbackRecord) {
      primaryLinkUrl = fallbackRecord.value.primaryLinkUrl;
      primaryLinkLabel = fallbackRecord.value.primaryLinkLabel;
    }
  }

  const allSecondaryLinks: LinkMetadata[] = [];

  recordsWithValues.forEach((record) => {
    const secondaryLinks = parseArrayOrJsonStringToArray<LinkMetadata>(
      record.value.secondaryLinks,
    );

    allSecondaryLinks.push(
      ...secondaryLinks.filter((link) => hasRecordFieldValue(link.url)),
    );
  });

  const uniqueSecondaryLinks = uniqBy(allSecondaryLinks, 'url');

  const result = {
    primaryLinkLabel,
    primaryLinkUrl,
    secondaryLinks:
      uniqueSecondaryLinks.length > 0 ? uniqueSecondaryLinks : null,
  };

  return result;
};
