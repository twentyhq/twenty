import { msg } from '@lingui/core/macro';
import { i18n } from '@lingui/core';
import { PageLayoutType } from '~/generated-metadata/graphql';

const PAGE_LAYOUT_TYPE_LABELS = {
  [PageLayoutType.DASHBOARD]: msg`Dashboard`,
  [PageLayoutType.RECORD_INDEX]: msg`Record index`,
  [PageLayoutType.RECORD_PAGE]: msg`Record page`,
  [PageLayoutType.STANDALONE_PAGE]: msg`Standalone page`,
} as const;

export const getPageLayoutTypeLabel = (type: PageLayoutType): string =>
  i18n._(PAGE_LAYOUT_TYPE_LABELS[type]);
