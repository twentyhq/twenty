import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeEmailContextRecordComponentState =
  createAtomComponentState<EmailComposerContextRecord | null>({
    key: 'side-panel/compose-email-context-record',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
