import uniqBy from 'lodash.uniqby';
import { type LinkMetadata, type LinksMetadata } from 'twenty-shared/types';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

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

  const allLinks: LinkMetadata[] = [];

  recordsWithValues.forEach((record) => {
    if (hasRecordFieldValue(record.value.primaryLinkUrl)) {
      allLinks.push({
        url: record.value.primaryLinkUrl,
        label: record.value.primaryLinkLabel,
      });
    }

    const secondaryLinks = parseArrayOrJsonStringToArray<LinkMetadata>(
      record.value.secondaryLinks,
    );

    allLinks.push(
      ...secondaryLinks.filter((link) => hasRecordFieldValue(link.url)),
    );
  });

  const uniqueLinks = uniqBy(allLinks, 'url').filter(
    (link) => link.url !== primaryLinkUrl,
  );

  const result = {
    primaryLinkLabel,
    primaryLinkUrl,
    secondaryLinks: uniqueLinks.length > 0 ? uniqueLinks : null,
  };

  return result;
};
