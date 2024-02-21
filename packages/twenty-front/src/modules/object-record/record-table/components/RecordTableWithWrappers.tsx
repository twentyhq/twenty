import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { RecordTable } from '@/object-record/record-table/components/RecordTable';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { useRecordTable } from '../hooks/useRecordTable';

import { RecordTableInternalEffect } from './RecordTableInternalEffect';
import useI18n from '@/ui/i18n/useI18n';

const StyledTableWithHeader = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
`;

const StyledTableContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
`;

type RecordTableWithWrappersProps = {
  objectNameSingular: string;
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
  createRecord: () => Promise<void>;
};

export const RecordTableWithWrappers = ({
                                          updateRecordMutation,
                                          createRecord,
                                          objectNameSingular,
                                          recordTableId,
                                          viewBarId,
                                        }: RecordTableWithWrappersProps) => {
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const { translate } = useI18n('translations');
  const { getNumberOfTableRowsState, getIsRecordTableInitialLoadingState } =
    useRecordTableStates(recordTableId);

  const numberOfTableRows = useRecoilValue(getNumberOfTableRowsState());

  const isRecordTableInitialLoading = useRecoilValue(
    getIsRecordTableInitialLoadingState(),
  );

  const { resetTableRowSelection, setRowSelectedState } = useRecordTable({
    recordTableId,
  });

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  const { persistViewFields } = useViewFields(viewBarId);

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  const objectLabel = foundObjectMetadataItem?.nameSingular;

  return (
    <EntityDeleteContext.Provider value={deleteOneRecord}>
      <ScrollWrapper>
        <RecordUpdateContext.Provider value={updateRecordMutation}>
          <StyledTableWithHeader>
            <StyledTableContainer>
              <div ref={tableBodyRef}>
                <RecordTable
                  recordTableId={recordTableId}
                  objectNameSingular={objectNameSingular}
                  onColumnsChange={useRecoilCallback(() => (columns) => {
                    persistViewFields(
                      mapColumnDefinitionsToViewFields(columns),
                    );
                  })}
                  createRecord={createRecord}
                />
                <DragSelect
                  dragSelectable={tableBodyRef}
                  onDragSelectionStart={resetTableRowSelection}
                  onDragSelectionChange={setRowSelectedState}
                />
              </div>
              <RecordTableInternalEffect
                recordTableId={recordTableId}
                tableBodyRef={tableBodyRef}
              />
              {!isRecordTableInitialLoading && numberOfTableRows === 0 && (
                <AnimatedPlaceholderEmptyContainer>
                  <AnimatedPlaceholder type="noRecord" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      {translate('addYourFirstLabel', { objectLabel: objectLabel })}
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      {translate('useOurApiOrAddYourFirst', { objectLabel: objectLabel })}
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                  <Button
                    Icon={IconPlus}
                    title={translate('addNameSingular', { nameSingular: objectLabel })}
                    variant={'secondary'}
                    onClick={createRecord}
                  />
                </AnimatedPlaceholderEmptyContainer>
              )}
            </StyledTableContainer>
          </StyledTableWithHeader>
        </RecordUpdateContext.Provider>
      </ScrollWrapper>
    </EntityDeleteContext.Provider>
  );
};
