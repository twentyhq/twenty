import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { GET_PIPELINE_PROGRESS, GET_PIPELINES } from '@/pipeline/queries';
import { BoardCardContext } from '@/pipeline/states/BoardCardContext';
import { pipelineProgressIdScopedState } from '@/pipeline/states/pipelineProgressIdScopedState';
import { selectedBoardCardsState } from '@/pipeline/states/selectedBoardCardsState';
import { BoardCardEditableFieldDate } from '@/ui/board/card-field/components/BoardCardEditableFieldDate';
import { BoardCardEditableFieldText } from '@/ui/board/card-field/components/BoardCardEditableFieldText';
import { ChipVariant } from '@/ui/chip/components/EntityChip';
import {
  IconCalendarEvent,
  IconCheck,
  IconCurrencyDollar,
  IconUser,
} from '@/ui/icon';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { useUpdateOnePipelineProgressMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { PipelineProgressForBoard } from '../types/CompanyProgress';

import { CompanyChip } from './CompanyChip';

const StyledBoardCard = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.selectedCard : theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background-color: ${({ theme, selected }) =>
      selected ? theme.selectedCardHover : theme.background.tertiary};
  }
  cursor: pointer;
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledBoardCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: 24px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  img {
    height: ${({ theme }) => theme.icon.size.md}px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    object-fit: cover;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;
const StyledBoardCardBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
  span {
    align-items: center;
    display: flex;
    flex-direction: row;
    svg {
      color: ${({ theme }) => theme.font.color.tertiary};
      margin-right: ${({ theme }) => theme.spacing(2)};
    }
  }
`;

export function CompanyBoardCard() {
  const theme = useTheme();

  const [updatePipelineProgress] = useUpdateOnePipelineProgressMutation();

  const [pipelineProgressId] = useRecoilScopedState(
    pipelineProgressIdScopedState,
    BoardCardContext,
  );
  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(pipelineProgressId || ''),
  );
  const { pipelineProgress, company } = companyProgress || {};
  const [selectedBoardCards, setSelectedBoardCards] = useRecoilState(
    selectedBoardCardsState,
  );

  const selected = selectedBoardCards.includes(pipelineProgressId || '');
  function setSelected(isSelected: boolean) {
    if (isSelected) {
      setSelectedBoardCards([...selectedBoardCards, pipelineProgressId || '']);
    } else {
      setSelectedBoardCards(
        selectedBoardCards.filter((id) => id !== pipelineProgressId),
      );
    }
  }

  const handleCardUpdate = useCallback(
    async (pipelineProgress: PipelineProgressForBoard) => {
      await updatePipelineProgress({
        variables: {
          id: pipelineProgress.id,
          amount: pipelineProgress.amount,
          closeDate: pipelineProgress.closeDate,
          closeConfidence: pipelineProgress.closeConfidence,
          pointOfContactId: pipelineProgress.pointOfContact?.id,
        },
        refetchQueries: [
          getOperationName(GET_PIPELINE_PROGRESS) ?? '',
          getOperationName(GET_PIPELINES) ?? '',
        ],
      });
    },
    [updatePipelineProgress],
  );

  const handleCheckboxChange = (checked: boolean) => {
    setSelected(checked);
  };

  if (!company || !pipelineProgress) {
    return null;
  }

  return (
    <StyledBoardCardWrapper>
      <StyledBoardCard selected={selected}>
        <StyledBoardCardHeader>
          <CompanyChip
            id={company.id}
            name={company.name}
            clickable
            picture={getLogoUrlFromDomainName(company.domainName)}
            variant={ChipVariant.transparent}
          />
          <div style={{ display: 'flex', flex: 1 }} />
          <Checkbox checked={selected} onChange={handleCheckboxChange} />
        </StyledBoardCardHeader>
        <StyledBoardCardBody>
          <span>
            <IconCurrencyDollar size={theme.icon.size.md} />
            <BoardCardEditableFieldText
              value={pipelineProgress.amount?.toString() || ''}
              placeholder="Opportunity amount"
              onChange={(value) =>
                handleCardUpdate({
                  ...pipelineProgress,
                  amount: parseInt(value),
                })
              }
            />
          </span>
          <span>
            <IconCalendarEvent size={theme.icon.size.md} />
            <BoardCardEditableFieldDate
              value={new Date(pipelineProgress.closeDate || Date.now())}
              onChange={(value) => {
                handleCardUpdate({
                  ...pipelineProgress,
                  closeDate: value.toISOString(),
                });
              }}
            />
          </span>
          <span>
            <IconUser size={theme.icon.size.md} />
          </span>
          <span>
            {/* TODO: Use right icon */}
            <IconCheck size={theme.icon.size.md} />
            <BoardCardEditableFieldText
              value={pipelineProgress.closeConfidence?.toString() || ''}
              placeholder="Opportunity confidence"
              onChange={(value) =>
                handleCardUpdate({
                  ...pipelineProgress,
                  closeConfidence: parseInt(value),
                })
              }
            />
          </span>
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
}
