import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';

import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { RecordBoardCardBody } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBody';
import { RecordBoardCardHeader } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeader';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { AppPath } from '@/types/AppPath';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { InView, useInView } from 'react-intersection-observer';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledBoardCard = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.quaternary : theme.background.secondary};
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.adaptiveColors.blue3 : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background-color: ${({ theme, selected }) =>
      selected && theme.accent.tertiary};
    border: 1px solid
      ${({ theme, selected }) =>
        selected ? theme.adaptiveColors.blue3 : theme.border.color.strong};
  }
  cursor: pointer;

  .checkbox-container {
    transition: all ease-in-out 160ms;
    opacity: ${({ selected }) => (selected ? 1 : 0)};
  }

  &:hover .checkbox-container {
    opacity: 1;
  }

  .compact-icon-container {
    transition: all ease-in-out 160ms;
    opacity: 0;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const RecordBoardCard = () => {
  const navigate = useNavigateApp();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { recordId } = useContext(RecordBoardCardContext);

  const visibleFieldDefinitions = useRecoilComponentValueV2(
    recordBoardVisibleFieldDefinitionsComponentSelector,
  );

  const isCompactModeActive = useRecoilComponentValueV2(
    isRecordBoardCompactModeActiveComponentState,
  );

  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const [isCurrentCardSelected, setIsCurrentCardSelected] =
    useRecoilComponentFamilyStateV2(
      isRecordBoardCardSelectedComponentFamilyState,
      recordId,
    );

  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const recordBoardId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
  );

  const actionMenuId = getActionMenuIdFromRecordIndexId(recordBoardId);

  const actionMenuDropdownId =
    getActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const setActionMenuDropdownPosition = useSetRecoilState(
    extractComponentState(
      recordIndexActionMenuDropdownPositionComponentState,
      actionMenuDropdownId,
    ),
  );

  const { openDropdown } = useDropdownV2();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const handleActionMenuDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsCurrentCardSelected(true);
    setActionMenuDropdownPosition({
      x: event.clientX,
      y: event.clientY,
    });
    openDropdown(actionMenuDropdownId);
  };

  const handleCardClick = () => {
    if (recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
      openRecordInCommandMenu({
        recordId,
        objectNameSingular,
      });
    } else {
      navigate(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      });
    }
  };

  const onMouseLeaveBoard = useDebouncedCallback(() => {
    if (isCompactModeActive && isCardExpanded) {
      setIsCardExpanded(false);
    }
  }, 800);

  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const { ref: cardRef } = useInView({
    root: scrollWrapperHTMLElement,
    rootMargin: '1000px',
  });

  const visibleFieldDefinitionsFiltered = visibleFieldDefinitions.filter(
    (boardField) => !boardField.isLabelIdentifier,
  );

  return (
    <StyledBoardCardWrapper
      className="record-board-card"
      onContextMenu={handleActionMenuDropdown}
    >
      <RecordValueSetterEffect recordId={recordId} />
      <InView>
        <StyledBoardCard
          ref={cardRef}
          selected={isCurrentCardSelected}
          onMouseLeave={onMouseLeaveBoard}
          onClick={handleCardClick}
        >
          <RecordBoardCardHeader
            isCardExpanded={isCardExpanded}
            setIsCardExpanded={setIsCardExpanded}
          />
          <AnimatedEaseInOut
            isOpen={isCardExpanded || !isCompactModeActive}
            initial={false}
          >
            <RecordBoardCardBody
              fieldDefinitions={visibleFieldDefinitionsFiltered}
            />
          </AnimatedEaseInOut>
        </StyledBoardCard>
      </InView>
    </StyledBoardCardWrapper>
  );
};
