/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum RecordSharingMode {
  NONE = 'NONE',
  PRIVATE = 'PRIVATE',
  INHERITED = 'INHERITED',
  OPEN_BY_DEFAULT = 'OPEN_BY_DEFAULT',
}

registerEnumType(RecordSharingMode, {
  name: 'RecordSharingMode',
  description:
    'How records of an object are shared: not at all, private until shared, readable through linked records, or open by default with per-record exceptions',
});
