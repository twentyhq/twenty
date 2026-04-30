import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { OrgNode } from '../types/hrm.types';

const MOCK_ORG: OrgNode = {
  id: 'O1', name: 'Laura Jimenez', title: 'CEO', department: 'operations',
  children: [
    { id: 'O2', name: 'Maria Lopez', title: 'HR Director', department: 'hr', children: [
      { id: 'O5', name: 'Pedro Ruiz', title: 'Recruiter', department: 'hr', children: [] },
    ]},
    { id: 'O3', name: 'Ana Torres', title: 'VP Engineering', department: 'engineering', children: [
      { id: 'O6', name: 'Diego Vargas', title: 'Frontend Lead', department: 'engineering', children: [] },
      { id: 'O7', name: 'Camila Ortiz', title: 'Backend Lead', department: 'engineering', children: [] },
    ]},
    { id: 'O4', name: 'Carlos Mendez', title: 'Sales Director', department: 'sales', children: [
      { id: 'O8', name: 'Sofia Garcia', title: 'Account Executive', department: 'sales', children: [] },
    ]},
  ],
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNode = styled.div`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  text-align: center;
  min-width: 140px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    min-width: 100px;
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  }
`;

const StyledNodeName = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledNodeTitle = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledChildren = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  position: relative;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: center;
    gap: ${themeCssVariables.spacing[1]};
  }
`;

const StyledConnector = styled.div`
  width: 1px;
  height: 16px;
  background: ${themeCssVariables.border.color.medium};
`;

const renderNode = (node: OrgNode): JSX.Element => (
  <StyledNodeContainer key={node.id}>
    <StyledNode>
      <StyledNodeName>{node.name}</StyledNodeName>
      <StyledNodeTitle>{node.title}</StyledNodeTitle>
    </StyledNode>
    {node.children.length > 0 && (
      <>
        <StyledConnector />
        <StyledChildren>
          {node.children.map((child) => renderNode(child))}
        </StyledChildren>
      </>
    )}
  </StyledNodeContainer>
);

export const OrgChart = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Organization Chart`}</StyledTitle>
      {renderNode(MOCK_ORG)}
    </StyledContainer>
  );
};
