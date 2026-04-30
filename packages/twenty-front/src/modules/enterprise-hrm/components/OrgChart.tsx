import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { OrgNode } from '../types/hrm.types';
import { GET_ORG_CHART } from '../hooks/useHRM';

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
    {node.children && node.children.length > 0 && (
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

  const { data, loading, error } = useQuery(GET_ORG_CHART);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const orgData: OrgNode | undefined = data?.orgChart;

  return (
    <StyledContainer>
      <StyledTitle>{t`Organization Chart`}</StyledTitle>
      {orgData && renderNode(orgData)}
    </StyledContainer>
  );
};
