import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { useBulkCreateTagJunctionRecords } from '@/object-record/record-tag-selected/hooks/useBulkCreateTagJunctionRecords';
import { useRefetchFindManyRecords } from '@/object-record/hooks/useRefetchFindManyRecords';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { styled } from '@linaria/react';
import { msg, t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconTag } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  overflow-y: auto;
`;

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

const SELECTABLE_LIST_ID = 'tag-selected-records-selectable-list';
const FOCUS_ID = 'tag-selected-records-focus';

type TagSelectedRecordsContainerProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  contextStoreInstanceId: string;
};

export const TagSelectedRecordsContainer = ({
  objectMetadataItem,
  contextStoreInstanceId,
}: TagSelectedRecordsContainerProps) => {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const { closeSidePanelMenu } = useSidePanelMenu();
  const { enqueueErrorSnackBar } = useSnackBar();

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
    contextStoreInstanceId,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    contextStoreInstanceId,
  );

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const { bulkCreateTagJunctionRecords, tagObjectNameSingular, isConfigValid } =
    useBulkCreateTagJunctionRecords({ objectMetadataItem });

  const { refetchFindManyRecords } = useRefetchFindManyRecords({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { loading, recordsToSelect, selectedRecords, filteredSelectedRecords } =
    useRecordsForSelect({
      objectNameSingular: tagObjectNameSingular ?? '__invalid__',
      searchFilterText: searchText,
      selectedIds: selectedTagIds,
      limit: 20,
      allowRequestsToTwentyIcons,
    });

  const handleChange = (item: SelectableItem, newSelectedValue: boolean) => {
    setSelectedTagIds((prev) =>
      newSelectedValue
        ? [...prev, item.id]
        : prev.filter((id) => id !== item.id),
    );
  };

  const handleApply = async () => {
    if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
      enqueueErrorSnackBar({
        message: t(msg`Please deselect "Select All" to use bulk tagging`),
      });
      return;
    }

    const selectedRecordIds = contextStoreTargetedRecordsRule.selectedRecordIds;

    if (!isDefined(tagObjectNameSingular) || selectedTagIds.length === 0) {
      return;
    }

    await bulkCreateTagJunctionRecords({ selectedRecordIds, selectedTagIds });
    await refetchFindManyRecords();
    closeSidePanelMenu();
  };

  const isApplyDisabled =
    selectedTagIds.length === 0 ||
    !isConfigValid ||
    !isDefined(tagObjectNameSingular);

  return (
    <SidePanelProvider value={{ isInSidePanel: true }}>
      <ShowPageContainer>
        <StyledContainer>
          <StyledContentContainer>
            <DropdownMenuSearchInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t(msg`Search tags`)}
            />
            <MultipleSelectDropdown
              selectableListId={SELECTABLE_LIST_ID}
              focusId={FOCUS_ID}
              itemsToSelect={recordsToSelect}
              filteredSelectedItems={filteredSelectedRecords}
              selectedItems={selectedRecords}
              searchFilter={searchText}
              onChange={handleChange}
              loadingItems={loading}
            />
          </StyledContentContainer>
          <StyledFooterContainer>
            <Button
              title={t`Cancel`}
              variant="secondary"
              size="small"
              onClick={closeSidePanelMenu}
            />
            <Button
              title={t`Apply to ${contextStoreNumberOfSelectedRecords} records`}
              variant="primary"
              accent="blue"
              size="small"
              Icon={IconTag}
              onClick={handleApply}
              disabled={isApplyDisabled}
            />
          </StyledFooterContainer>
        </StyledContainer>
      </ShowPageContainer>
    </SidePanelProvider>
  );
};
