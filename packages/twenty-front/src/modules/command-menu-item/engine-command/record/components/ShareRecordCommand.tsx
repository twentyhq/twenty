import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { ShareRecordDropdownOpenEffect } from '@/command-menu-item/engine-command/record/components/ShareRecordDropdownOpenEffect';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { useContextStoreInstanceId } from '@/context-store/hooks/useContextStoreInstanceId';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordSharingDropdownContent } from '@/object-record/record-sharing/components/RecordSharingDropdownContent';
import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

const SHARE_DROPDOWN_FALLBACK_TOP_OFFSET = 48;
const SHARE_DROPDOWN_FALLBACK_RIGHT_OFFSET = 16;

// Sharing is edited in submenus, so the command opens the sharing dropdown on
// what it was launched from: a row menu marks its trigger with its context
// store instance, a pinned button carries its command menu item id
const findShareDropdownAnchor = ({
  commandMenuItemId,
  contextStoreInstanceId,
}: {
  commandMenuItemId: string;
  contextStoreInstanceId: string;
}) =>
  document.querySelector(
    `[data-command-menu-anchor-instance-id="${contextStoreInstanceId}"]`,
  ) ??
  document.querySelector(
    `[data-command-menu-item-id="${commandMenuItemId}"]`,
  ) ??
  createVirtualElementFromPosition({
    x: window.innerWidth - SHARE_DROPDOWN_FALLBACK_RIGHT_OFFSET,
    y: SHARE_DROPDOWN_FALLBACK_TOP_OFFSET,
  });

type ShareRecordDropdownProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
  commandMenuItemId: string;
};

const ShareRecordDropdown = ({
  objectMetadataItem,
  recordId,
  commandMenuItemId,
}: ShareRecordDropdownProps) => {
  const { t } = useLingui();
  const unmountCommand = useUnmountCommand();
  const contextStoreInstanceId = useContextStoreInstanceId();
  const [anchor] = useState(() =>
    findShareDropdownAnchor({ commandMenuItemId, contextStoreInstanceId }),
  );
  const sharingState = useRecordSharing({
    recordTarget: { objectMetadataId: objectMetadataItem.id, recordId },
    isOpen: true,
  });
  const dropdownId = `share-record-${commandMenuItemId}`;
  const objectLabel = objectMetadataItem.labelSingular.toLowerCase();

  return (
    <>
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      <ShareRecordDropdownOpenEffect dropdownId={dropdownId} />
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

export const ShareRecordCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  if (!isDefined(objectMetadataItem) || selectedRecords.length !== 1) {
    throw new Error('Sharing needs exactly one selected record');
  }

  return (
    <ShareRecordDropdown
      objectMetadataItem={objectMetadataItem}
      recordId={selectedRecords[0].id}
      commandMenuItemId={commandMenuItemId}
    />
  );
};
