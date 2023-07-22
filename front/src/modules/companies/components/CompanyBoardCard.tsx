import { ReactNode, useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { PipelineProgressPointOfContactEditableField } from '@/pipeline/editable-field/components/PipelineProgressPointOfContactEditableField';
import { ProbabilityEditableField } from '@/pipeline/editable-field/components/ProbabilityEditableField';
import { GET_PIPELINE_PROGRESS, GET_PIPELINES } from '@/pipeline/queries';
import { BoardCardContext } from '@/pipeline/states/BoardCardContext';
import { pipelineProgressIdScopedState } from '@/pipeline/states/pipelineProgressIdScopedState';
import { selectedBoardCardsState } from '@/pipeline/states/selectedBoardCardsState';
import { ChipVariant } from '@/ui/chip/components/EntityChip';
import { DateEditableField } from '@/ui/editable-field/variants/components/DateEditableField';
import { NumberEditableField } from '@/ui/editable-field/variants/components/NumberEditableField';
import { IconCurrencyDollar, IconProgressCheck } from '@/ui/icon';
import { IconCalendarEvent } from '@/ui/icon';
import { Checkbox, CheckboxVariant } from '@/ui/input/components/Checkbox';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { useUpdateOnePipelineProgressMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { PipelineProgressForBoard } from '../types/CompanyProgress';

import { CompanyChip } from './CompanyChip';

const StyledBoardCard = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.quaternary : theme.background.secondary};
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.accent.secondary : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background-color: ${({ theme, selected }) =>
      selected && theme.accent.tertiary};
    border: 1px solid
      ${({ theme, selected }) =>
        selected ? theme.accent.primary : theme.border.color.medium};
  }
  cursor: pointer;

  .checkbox-container {
    opacity: 0;
  }

  &:hover .checkbox-container {
    opacity: 1;
  }
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledBoardCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 24px;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
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
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2.5)};
  padding-right: ${({ theme }) => theme.spacing(2)};
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

const StyledCheckboxContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: end;
`;

const StyledFieldContainer = styled.div`
  width: max-content;
`;

export function CompanyBoardCard() {
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
          probability: pipelineProgress.probability,
          pointOfContactId: pipelineProgress.pointOfContactId || undefined,
        },
        refetchQueries: [
          getOperationName(GET_PIPELINE_PROGRESS) ?? '',
          getOperationName(GET_PIPELINES) ?? '',
        ],
      });
    },
    [updatePipelineProgress],
  );

  if (!company || !pipelineProgress) {
    return null;
  }

  function PreventSelectOnClickContainer({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <StyledFieldContainer
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </StyledFieldContainer>
    );
  }

  return (
    <StyledBoardCardWrapper>
      <StyledBoardCard
        selected={selected}
        onClick={() => setSelected(!selected)}
      >
        <StyledBoardCardHeader>
          <CompanyChip
            id={company.id}
            name={company.name}
            clickable
            picture={getLogoUrlFromDomainName(company.domainName)}
            variant={ChipVariant.transparent}
          />
          <StyledCheckboxContainer className="checkbox-container">
            <Checkbox
              checked={selected}
              onChange={() => setSelected(!selected)}
              variant={CheckboxVariant.Secondary}
            />
          </StyledCheckboxContainer>
        </StyledBoardCardHeader>
        <StyledBoardCardBody>
          <PreventSelectOnClickContainer>
            <DateEditableField
              icon={<IconCalendarEvent />}
              value={pipelineProgress.closeDate}
              onSubmit={(value) =>
                handleCardUpdate({
                  ...pipelineProgress,
                  closeDate: value,
                })
              }
            />
          </PreventSelectOnClickContainer>
          <PreventSelectOnClickContainer>
            <NumberEditableField
              icon={<IconCurrencyDollar />}
              placeholder="Opportunity amount"
              value={pipelineProgress.amount}
              onSubmit={(value) =>
                handleCardUpdate({
                  ...pipelineProgress,
                  amount: value,
                })
              }
            />
          </PreventSelectOnClickContainer>
          <PreventSelectOnClickContainer>
            <ProbabilityEditableField
              icon={<IconProgressCheck />}
              value={pipelineProgress.probability}
              onSubmit={(value) => {
                handleCardUpdate({
                  ...pipelineProgress,
                  probability: value,
                });
              }}
            />
          </PreventSelectOnClickContainer>
          <PreventSelectOnClickContainer>
            <PipelineProgressPointOfContactEditableField
              pipelineProgress={pipelineProgress}
            />
          </PreventSelectOnClickContainer>
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
}
