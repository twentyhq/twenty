import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { RecordSharingDropdownContent } from '@/object-record/record-sharing/components/RecordSharingDropdownContent';
import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

const SHARE_DROPDOWN_FALLBACK_TOP_OFFSET = 48;
const SHARE_DROPDOWN_FALLBACK_RIGHT_OFFSET = 16;

// Sharing is edited in submenus, so the command opens the sharing dropdown on
// the button it was launched from, or in the top right corner otherwise
const findShareDropdownAnchor = (commandMenuItemId: string) =>
  document.querySelector(
    `[data-command-menu-item-id="${commandMenuItemId}"]`,
  ) ??
  createVirtualElementFromPosition({
    x: window.innerWidth - SHARE_DROPDOWN_FALLBACK_RIGHT_OFFSET,
    y: SHARE_DROPDOWN_FALLBACK_TOP_OFFSET,
  });

export const ShareRecordCommand = () => {
  const { t } = useLingui();
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );
  const unmountCommand = useUnmountCommand();
  const { openDropdown } = useOpenDropdown();
  const [anchor] = useState(() => findShareDropdownAnchor(commandMenuItemId));
  const dropdownId = `share-record-${commandMenuItemId}`;

  if (!isDefined(objectMetadataItem) || selectedRecords.length !== 1) {
    throw new Error('Sharing needs exactly one selected record');
  }

  const recordId = selectedRecords[0].id;
  const recordTarget = { objectMetadataId: objectMetadataItem.id, recordId };
  const sharingState = useRecordSharing({ recordTarget, isOpen: true });
  const objectLabel = objectMetadataItem.labelSingular.toLowerCase();

  useEffect(() => {
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [dropdownId, openDropdown]);

  return (
    <>
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      <DropdownRoot
        dropdownId={dropdownId}
        type="menu"
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            unmountCommand(commandMenuItemId);
          }
        }}
      >
        <DropdownContent width={320} align="end" anchor={anchor}>
          <RecordSharingDropdownContent
            title={t`Share ${objectLabel}`}
            recordUrl={
              new URL(
                getLinkToShowPage(objectMetadataItem.nameSingular, {
                  id: recordId,
                }),
                window.location.origin,
              ).href
            }
            sharingState={sharingState}
          />
        </DropdownContent>
      </DropdownRoot>
    </>
  );
};
