import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemSectionContextChip } from '@/command-menu-item/display/components/CommandMenuItemSectionContextChip';
import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const MAX_RECORD_AVATARS = 3;

const StyledAvatars = styled.span`
  align-items: center;
  display: flex;
`;

export const CommandMenuItemSelectionContextChip = () => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { objectMetadataItem } = useContextStoreObjectMetadataItem();

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  // Select-all targets records that may not be loaded, so only an explicit
  // selection has avatars to show.
  const recordIdsWithAvatar =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds.slice(
          0,
          MAX_RECORD_AVATARS,
        )
      : [];

  const records = useAtomFamilySelectorValue(recordStoreRecordsSelector, {
    recordIds: recordIdsWithAvatar,
  });

  const { numberOfSelectedRecords } = commandMenuContextApi;

  if (!isDefined(objectMetadataItem) || numberOfSelectedRecords === 0) {
    return null;
  }

  const [firstRecord] = records;

  const label =
    numberOfSelectedRecords === 1 && isDefined(firstRecord)
      ? getObjectRecordIdentifier({
          objectMetadataItem,
          record: firstRecord,
          allowRequestsToTwentyIcons,
        }).name
      : `${numberOfSelectedRecords} ${objectMetadataItem.labelPlural}`;

  return (
    <CommandMenuItemSectionContextChip
      startElement={
        records.length > 0 ? (
          <StyledAvatars>
            {records.map((record) => (
              <SidePanelContextRecordChipAvatars
                key={record.id}
                objectMetadataItem={objectMetadataItem}
                record={record}
              />
            ))}
          </StyledAvatars>
        ) : null
      }
      label={label}
    />
  );
};
