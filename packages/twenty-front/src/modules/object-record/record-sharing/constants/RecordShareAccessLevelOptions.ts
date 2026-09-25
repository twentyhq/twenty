import { msg } from '@lingui/core/macro';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

export const RECORD_SHARE_ACCESS_LEVEL_OPTIONS = [
  { value: RecordShareAccessLevel.READ, label: msg`Viewer` },
  { value: RecordShareAccessLevel.READ_WRITE, label: msg`Editor` },
  { value: RecordShareAccessLevel.FULL, label: msg`Full access` },
];
