import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const LOG_CONSOLE_ACTOR_TYPE_LABELS: Partial<
  Record<FieldActorValue['source'], MessageDescriptor>
> = {
  MANUAL: msg`Member`,
  API: msg`API key`,
  IMPORT: msg`Import`,
  EMAIL: msg`Email sync`,
  CALENDAR: msg`Calendar sync`,
  WORKFLOW: msg`Workflow`,
  WEBHOOK: msg`Webhook`,
  APPLICATION: msg`App`,
  AGENT: msg`Agent`,
};
