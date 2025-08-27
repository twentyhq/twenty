import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { RecordIndexBoardContainer } from '@/object-record/record-index/components/RecordIndexBoardContainer';
import { RecordIndexBoardDataLoader } from '@/object-record/record-index/components/RecordIndexBoardDataLoader';
import { RecordIndexBoardDataLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardDataLoaderEffect';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';

import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';

import { RecordIndexFiltersToContextStoreEffect } from '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewType } from '@/views/types/ViewType';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  overflow: hidden;
`;

const StyledContainerWithPadding = styled.div`
  box-sizing: border-box;
  height: calc(100% - ${({ theme }) => theme.spacing(10)});
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export const RecordIndexContainer = () => {
  const [recordIndexViewType] = useRecoilState(recordIndexViewTypeState);

  const {
    objectNamePlural,
    recordIndexId,
    objectMetadataItem,
    objectNameSingular,
  } = useRecordIndexContextOrThrow();

  return (
    <>
      <StyledContainer>
        <InformationBannerWrapper />
        <SpreadsheetImportProvider>
          <ViewBar
            viewBarId={recordIndexId}
            optionsDropdownButton={
              <ObjectOptionsDropdown
                recordIndexId={recordIndexId}
                objectMetadataItem={objectMetadataItem}
                viewType={recordIndexViewType ?? ViewType.Table}
              />
            }
          />
          <RecordIndexViewBarEffect
            objectNamePlural={objectNamePlural}
            viewBarId={recordIndexId}
          />
        </SpreadsheetImportProvider>
        <RecordIndexFiltersToContextStoreEffect />
        {recordIndexViewType === ViewType.Table && (
          <>
            <RecordIndexTableContainer
              recordTableId={recordIndexId}
              viewBarId={recordIndexId}
            />
            <RecordIndexTableContainerEffect />
          </>
        )}
        {recordIndexViewType === ViewType.Kanban && (
          <StyledContainerWithPadding>
            <RecordIndexBoardContainer
              recordBoardId={recordIndexId}
              viewBarId={recordIndexId}
              objectNameSingular={objectNameSingular}
            />
            <RecordIndexBoardDataLoader
              objectNameSingular={objectNameSingular}
              recordBoardId={recordIndexId}
            />
            <RecordIndexBoardDataLoaderEffect recordBoardId={recordIndexId} />
          </StyledContainerWithPadding>
        )}
      </StyledContainer>
    </>
  );
};
