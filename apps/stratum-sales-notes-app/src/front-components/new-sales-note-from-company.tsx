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
  COMPANY_OBJECT_UID,
  NEW_SALES_NOTE_FROM_COMPANY_COMMAND_UID,
  NEW_SALES_NOTE_FROM_COMPANY_FRONT_COMPONENT_UID,
} from 'src/constants/universal-identifiers';
import { createSalesNoteForSource } from 'src/utils/create-sales-note';

// Headless effect: fires once on mount, creates a salesNote linked to the
// current Company (companyId on salesNote), navigates to the new record,
// and unmounts. Owner is auto-set by the on-sales-note-created logic
// function.
const NewSalesNoteFromCompany = () => {
  const companyId = useRecordId();
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);

    void (async () => {
      try {
        if (typeof companyId !== 'string' || companyId.length === 0) {
          await enqueueSnackbar({
            message: 'No company record selected',
            variant: 'error',
          });
          await unmountFrontComponent();
          return;
        }

        const salesNoteId = await createSalesNoteForSource({
          kind: 'company',
          companyId,
        });

        await enqueueSnackbar({
          message: 'Sales note created and linked to this company',
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
  }, [companyId, hasRun]);

  return null;
};

export default defineFrontComponent({
  universalIdentifier: NEW_SALES_NOTE_FROM_COMPANY_FRONT_COMPONENT_UID,
  name: 'New Sales Note From Company',
  description:
    'Creates a fresh sales note attached to the current Company (account) and navigates to it.',
  isHeadless: true,
  component: NewSalesNoteFromCompany,
  command: {
    universalIdentifier: NEW_SALES_NOTE_FROM_COMPANY_COMMAND_UID,
    label: '+ Sales note',
    shortLabel: 'Sales note',
    icon: 'IconNotebook',
    isPinned: true,
    availabilityType: 'RECORD_SELECTION',
    availabilityObjectUniversalIdentifier: COMPANY_OBJECT_UID,
  },
});
