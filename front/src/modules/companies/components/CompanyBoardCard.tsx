import { ReactNode, useContext } from 'react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { BoardCardIdContext } from '@/ui/board/contexts/BoardCardIdContext';
import { useCurrentCardSelected } from '@/ui/board/hooks/useCurrentCardSelected';
import { viewFieldsDefinitionsState } from '@/ui/board/states/viewFieldsDefinitionsState';
import { EntityChipVariant } from '@/ui/chip/components/EntityChip';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/contexts/EditableFieldMutationContext';
import {
  Checkbox,
  CheckboxVariant,
} from '@/ui/input/checkbox/components/Checkbox';
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
    opacity: ${({ selected }) => (selected ? 1 : 0)};
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
  const { currentCardSelected, setCurrentCardSelected } =
    useCurrentCardSelected();
  const boardCardId = useContext(BoardCardIdContext);

  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(boardCardId ?? ''),
  );
  const { pipelineProgress, company } = companyProgress ?? {};

  const viewFieldsDefinitions = useRecoilValue(viewFieldsDefinitionsState);

  // boardCardId check can be moved to a wrapper to avoid unnecessary logic above
  if (!company || !pipelineProgress || !boardCardId) {
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
        selected={currentCardSelected}
        onClick={() => setCurrentCardSelected(!currentCardSelected)}
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
              checked={currentCardSelected}
              onChange={() => setCurrentCardSelected(!currentCardSelected)}
              variant={CheckboxVariant.Secondary}
            />
          </StyledCheckboxContainer>
        </StyledBoardCardHeader>
        <StyledBoardCardBody>
          <EditableFieldMutationContext.Provider
            value={useUpdateOnePipelineProgressMutation}
          >
            <EditableFieldEntityIdContext.Provider value={boardCardId}>
              {viewFieldsDefinitions.map((viewField) => {
                return (
                  <PreventSelectOnClickContainer key={viewField.id}>
                    <EditableFieldDefinitionContext.Provider
                      value={{
                        id: viewField.id,
                        label: viewField.label,
                        Icon: viewField.icon,
                        type: viewField.metadata.type,
                        metadata: viewField.metadata,
                      }}
                    >
                      <GenericEditableField />
                    </EditableFieldDefinitionContext.Provider>
                  </PreventSelectOnClickContainer>
                );
              })}
            </EditableFieldEntityIdContext.Provider>
          </EditableFieldMutationContext.Provider>
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
}
