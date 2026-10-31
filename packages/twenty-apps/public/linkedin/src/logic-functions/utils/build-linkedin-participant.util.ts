import { type IngestMessageParticipant } from 'twenty-sdk/logic-function';

import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const buildLinkedinParticipant = ({
  role,
  user,
}: {
  role: IngestMessageParticipant['role'];
  user: UnipileUser;
}): IngestMessageParticipant => ({
  role,
  handle: buildLinkedinProfileHandle(user),
  displayName: user.display_name,
});
