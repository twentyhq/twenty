/* @license Enterprise */

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type ObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';

export const resolveRecordSharingMode = ({
  isShareRequired,
  canRestrictGeneralAccess,
}: Pick<
  ObjectSharing,
  'isShareRequired' | 'canRestrictGeneralAccess'
>): RecordSharingMode => {
  if (isShareRequired) {
    return RecordSharingMode.PRIVATE;
  }

  return canRestrictGeneralAccess
    ? RecordSharingMode.OPEN_BY_DEFAULT
    : RecordSharingMode.ROLE_ONLY;
};
