import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
  unmountFrontComponent,
  useRecordId,
} from 'twenty-sdk/front-component';

import {
  NEW_SALES_NOTE_FROM_OPPORTUNITY_COMMAND_UID,
  NEW_SALES_NOTE_FROM_OPPORTUNITY_FRONT_COMPONENT_UID,
  OPPORTUNITY_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { createSalesNoteForSource } from 'src/utils/create-sales-note';

// Headless effect: fires once on mount, creates a salesNote linked to the
// current Opportunity (opportunityId on salesNote), navigates to the new
// record, and unmounts. Owner is auto-set by the on-sales-note-created
// logic function.
const NewSalesNoteFromOpportunity = () => {
  const opportunityId = useRecordId();
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);

    void (async () => {
      try {
        if (typeof opportunityId !== 'string' || opportunityId.length === 0) {
          await enqueueSnackbar({
            message: 'No opportunity record selected',
            variant: 'error',
          });
          await unmountFrontComponent();
          return;
        }

        const salesNoteId = await createSalesNoteForSource({
          kind: 'opportunity',
          opportunityId,
        });

        await enqueueSnackbar({
          message: 'Sales note created and linked to this opportunity',
          variant: 'success',
        });

        await navigate(AppPath.RecordShowPage, {
          objectNameSingular: 'salesNote',
          objectRecordId: salesNoteId,
        });

        await unmountFrontComponent();
      } catch (err) {
        await enqueueSnackbar({
          message:
            err instanceof Error
              ? err.message
              : 'Failed to create sales note',
          variant: 'error',
        });
        await unmountFrontComponent();
      }
    })();
  }, [opportunityId, hasRun]);

  return null;
};

export default defineFrontComponent({
  universalIdentifier: NEW_SALES_NOTE_FROM_OPPORTUNITY_FRONT_COMPONENT_UID,
  name: 'New Sales Note From Opportunity',
  description:
    'Creates a fresh sales note attached to the current Opportunity and navigates to it.',
  isHeadless: true,
  component: NewSalesNoteFromOpportunity,
  command: {
    universalIdentifier: NEW_SALES_NOTE_FROM_OPPORTUNITY_COMMAND_UID,
    label: '+ Sales note',
    shortLabel: 'Sales note',
    icon: 'IconNotebook',
    isPinned: true,
    availabilityType: 'RECORD_SELECTION',
    availabilityObjectUniversalIdentifier: OPPORTUNITY_OBJECT_UID,
  },
});
