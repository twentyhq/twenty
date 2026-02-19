import {
  RECIPIENT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  RECIPIENT_UNIVERSAL_IDENTIFIER,
} from '@/cli/__tests__/apps/rich-app/src/objects/recipient.object';
import { defineView } from '@/sdk';
import { ViewType } from 'twenty-shared/types';

export const ALL_RECIPIENTS_VIEW_ID = 'b1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d';

export default defineView({
  universalIdentifier: ALL_RECIPIENTS_VIEW_ID,
  name: 'All Recipients',
  objectUniversalIdentifier: RECIPIENT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconUser',
  position: 1,
  fields: [
    {
      universalIdentifier: 'bf1a2b3c-0003-4a7b-8c9d-0e1f2a3b4c5d',
      fieldMetadataUniversalIdentifier:
        RECIPIENT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
