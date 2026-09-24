import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const MAX_RECORD_AVATARS = 3;

const StyledOverflowCount = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[4]};
  margin-left: -${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export const useCommandMenuItemSelectionSectionContext = ():
  | CommandMenuItemSectionContext
  | undefined => {
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
    return undefined;
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

  const overflowCount = numberOfSelectedRecords - records.length;

  return {
    icon:
      records.length > 0 ? (
        <>
          {records.map((record) => (
            <SidePanelContextRecordChipAvatars
              key={record.id}
              objectMetadataItem={objectMetadataItem}
              record={record}
              borderColor={themeCssVariables.background.primary}
            />
          ))}
          {overflowCount > 0 && (
            <StyledOverflowCount>+{overflowCount}</StyledOverflowCount>
          )}
        </>
      ) : undefined,
    label,
  };
};
