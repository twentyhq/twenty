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
  NEW_SALES_NOTE_FROM_PERSON_COMMAND_UID,
  NEW_SALES_NOTE_FROM_PERSON_FRONT_COMPONENT_UID,
  PERSON_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { createSalesNoteForSource } from 'src/utils/create-sales-note';

// Headless effect: fires once on mount, creates a salesNote linked to the
// current Person, navigates to the new record, and unmounts itself. The
// Owner field is auto-set by the on-sales-note-created logic function.
const NewSalesNoteFromPerson = () => {
  const personId = useRecordId();
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);

    void (async () => {
      try {
        if (typeof personId !== 'string' || personId.length === 0) {
          await enqueueSnackbar({
            message: 'No person record selected',
            variant: 'error',
          });
          await unmountFrontComponent();
          return;
        }

        const salesNoteId = await createSalesNoteForSource({
          kind: 'person',
          personId,
        });

        await enqueueSnackbar({
          message: 'Sales note created and linked to this contact',
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
  }, [personId, hasRun]);

  return null;
};

export default defineFrontComponent({
  universalIdentifier: NEW_SALES_NOTE_FROM_PERSON_FRONT_COMPONENT_UID,
  name: 'New Sales Note From Person',
  description:
    'Creates a fresh sales note attached to the current Person record (as an attendee) and navigates to it.',
  isHeadless: true,
  component: NewSalesNoteFromPerson,
  command: {
    universalIdentifier: NEW_SALES_NOTE_FROM_PERSON_COMMAND_UID,
    label: '+ Sales note',
    shortLabel: 'Sales note',
    icon: 'IconNotebook',
    isPinned: true,
    availabilityType: 'RECORD_SELECTION',
    availabilityObjectUniversalIdentifier: PERSON_OBJECT_UID,
  },
});
