import { ReactNode, useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { BoardCardIdContext } from '@/ui/board/states/BoardCardIdContext';
import { selectedBoardCardIdsState } from '@/ui/board/states/selectedBoardCardIdsState';
import { viewFieldsDefinitionsState } from '@/ui/board/states/viewFieldsDefinitionsState';
import { EntityChipVariant } from '@/ui/chip/components/EntityChip';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { EditableFieldContext } from '@/ui/editable-field/states/EditableFieldContext';
import {
  Checkbox,
  CheckboxVariant,
} from '@/ui/input/checkbox/components/Checkbox';
import { EntityUpdateMutationHookContext } from '@/ui/table/states/EntityUpdateMutationHookContext';
import { useUpdateOnePipelineProgressMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { companyProgressesFamilyState } from '../states/companyProgressesFamilyState';

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
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export function CompanyBoardCard() {
  const boardCardId = useContext(BoardCardIdContext);

  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(boardCardId ?? ''),
  );
  const { pipelineProgress, company } = companyProgress ?? {};

  const [selectedBoardCards, setSelectedBoardCards] = useRecoilState(
    selectedBoardCardIdsState,
  );
  const viewFieldsDefinitions = useRecoilValue(viewFieldsDefinitionsState);

  const selected = selectedBoardCards.includes(boardCardId ?? '');

  function setSelected(isSelected: boolean) {
    if (isSelected) {
      setSelectedBoardCards([...selectedBoardCards, boardCardId ?? '']);
    } else {
      setSelectedBoardCards(
        selectedBoardCards.filter((id) => id !== boardCardId),
      );
    }
  }

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
    <EntityUpdateMutationHookContext.Provider
      value={useUpdateOnePipelineProgressMutation}
    >
      <StyledBoardCardWrapper>
        <StyledBoardCard
          selected={selected}
          onClick={() => setSelected(!selected)}
        >
          <StyledBoardCardHeader>
            <CompanyChip
              id={company.id}
              name={company.name}
              pictureUrl={getLogoUrlFromDomainName(company.domainName)}
              variant={EntityChipVariant.Transparent}
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
            {viewFieldsDefinitions.map((viewField) => {
              return (
                <PreventSelectOnClickContainer key={viewField.id}>
                  <EditableFieldContext.Provider
                    value={{
                      entityId: boardCardId,
                      mutation: useUpdateOnePipelineProgressMutation,
                      fieldDefinition: null,
                    }}
                  >
                    <GenericEditableField viewField={viewField} />
                  </EditableFieldContext.Provider>
                </PreventSelectOnClickContainer>
              );
            })}
          </StyledBoardCardBody>
        </StyledBoardCard>
      </StyledBoardCardWrapper>
    </EntityUpdateMutationHookContext.Provider>
  );
}
