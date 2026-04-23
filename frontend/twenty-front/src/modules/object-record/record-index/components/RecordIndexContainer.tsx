import { styled } from '@linaria/react';

import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';

import { RecordIndexCalendarContainer } from '@/object-record/record-index/components/RecordIndexCalendarContainer';
import { RecordIndexEmptyStateNotShared } from '@/object-record/record-index/components/RecordIndexEmptyStateNotShared';
import { RecordIndexFiltersToContextStoreEffect } from '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewType } from '@/views/types/ViewType';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  width: 100%;
`;

const StyledContainerWithPadding = styled.div`
  box-sizing: border-box;
  flex: 1;
  margin-left: ${themeCssVariables.spacing[2]};
  min-height: 0;
`;

export const RecordIndexContainer = () => {
  const recordIndexViewType = useAtomStateValue(recordIndexViewTypeState);

  const {
    objectNamePlural,
    recordIndexId,
    objectMetadataItem,
    objectNameSingular,
  } = useRecordIndexContextOrThrow();

  const { hasCurrentViewNonReadableFields, nonReadableViewFieldInfo } =
    useHasCurrentViewNonReadableFields(objectMetadataItem);

  return (
    <>
      <StyledContainer>
        <InformationBannerWrapper />
        <SpreadsheetImportProvider>
          <ViewBar
            isReadOnly={hasCurrentViewNonReadableFields}
            viewBarId={recordIndexId}
            optionsDropdownButton={
              <ObjectOptionsDropdown
                recordIndexId={recordIndexId}
                objectMetadataItem={objectMetadataItem}
                viewType={recordIndexViewType ?? ViewType.TABLE}
              />
            }
          />
          <RecordIndexViewBarEffect
            objectNamePlural={objectNamePlural}
            viewBarId={recordIndexId}
          />
        </SpreadsheetImportProvider>
        {hasCurrentViewNonReadableFields ? (
          <RecordIndexEmptyStateNotShared
            nonReadableViewFieldInfo={nonReadableViewFieldInfo}
          />
        ) : (
          <>
            <RecordIndexFiltersToContextStoreEffect />
            {recordIndexViewType === ViewType.TABLE && (
              <RecordIndexTableContainer recordTableId={recordIndexId} />
            )}
            {recordIndexViewType === ViewType.KANBAN && (
              <StyledContainerWithPadding>
                <RecordBoardContainer
                  recordBoardId={recordIndexId}
                  viewBarId={recordIndexId}
                  objectNameSingular={objectNameSingular}
                />
              </StyledContainerWithPadding>
            )}
            {recordIndexViewType === ViewType.CALENDAR && (
              <StyledContainerWithPadding>
                <RecordIndexCalendarContainer
                  recordCalendarInstanceId={recordIndexId}
                  viewBarInstanceId={recordIndexId}
                />
              </StyledContainerWithPadding>
            )}
          </>
        )}
      </StyledContainer>
    </>
  );
};
