import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCurrencyDollar } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { GET_PIPELINES } from '@/pipeline-progress/queries';
import { BoardCardContext } from '@/pipeline-progress/states/BoardCardContext';
import { isBoardCardSelectedFamilyState } from '@/pipeline-progress/states/isBoardCardSelectedFamilyState';
import { pipelineProgressIdScopedState } from '@/pipeline-progress/states/pipelineProgressIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { BoardCardEditableFieldDate } from '@/ui/board-card-field-inputs/components/BoardCardEditableFieldDate';
import { BoardCardEditableFieldText } from '@/ui/board-card-field-inputs/components/BoardCardEditableFieldText';
import { Checkbox } from '@/ui/components/form/Checkbox';
import { IconCalendarEvent } from '@/ui/icons';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  PipelineProgress,
  useUpdateOnePipelineProgressMutation,
} from '~/generated/graphql';
import { companyBoardIndexState } from '~/pages/opportunities/companyBoardIndexState';

import {
  CompanyForBoard,
  PipelineProgressForBoard,
} from '../types/CompanyProgress';

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
    companyBoardIndexState(pipelineProgressId || ''),
  );
  const { pipelineProgress, company } = companyProgress || {};
  const [selected, setSelected] = useRecoilState(
    isBoardCardSelectedFamilyState(pipelineProgressId || ''),
  );

  const handleCardUpdate = useCallback(
    async (
      pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
    ) => {
      await updatePipelineProgress({
        variables: {
          id: pipelineProgress.id,
          amount: pipelineProgress.amount,
          closeDate: pipelineProgress.closeDate || null,
        },
        refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
      });
    },
    [updatePipelineProgress],
  );

  const handleCheckboxChange = () => {
    setSelected(!selected);
  };

  if (!company || !pipelineProgress) {
    return null;
  }

  return (
    <StyledBoardCardWrapper>
      <StyledBoardCard selected={selected}>
        <StyledBoardCardHeader>
          <img
            src={getLogoUrlFromDomainName(company.domainName).toString()}
            alt={`${company.name}-company-logo`}
          />
          <span>{company.name}</span>
          <div style={{ display: 'flex', flex: 1 }} />
          <div onClick={handleCheckboxChange}>
            <Checkbox checked={selected} />
          </div>
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
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
}
