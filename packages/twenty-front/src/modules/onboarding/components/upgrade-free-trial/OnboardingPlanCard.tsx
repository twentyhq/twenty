import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Radio } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.button<{ hasBody: boolean }>`
  align-items: flex-start;
  background-color: transparent;
  border: none;
  border-bottom: ${({ hasBody }) =>
    hasBody ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;
`;

const StyledHeaderLeft = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTitleSuffix = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledNote = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBadge = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

type OnboardingPlanCardProps = {
  title: string;
  titleSuffix?: string;
  note?: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
};

export const OnboardingPlanCard = ({
  title,
  titleSuffix,
  note,
  badge,
  selected,
  onSelect,
  children,
}: OnboardingPlanCardProps) => (
  <StyledCard>
    <StyledHeader
      type="button"
      hasBody={isDefined(children)}
      onClick={onSelect}
    >
      <StyledHeaderLeft>
        <StyledTitleRow>
          <StyledTitle>{title}</StyledTitle>
          {isDefined(titleSuffix) && (
            <StyledTitleSuffix>{titleSuffix}</StyledTitleSuffix>
          )}
        </StyledTitleRow>
        {isDefined(note) && <StyledNote>{note}</StyledNote>}
      </StyledHeaderLeft>
      <StyledHeaderRight>
        {isDefined(badge) && <StyledBadge>{badge}</StyledBadge>}
        <Radio checked={selected} />
      </StyledHeaderRight>
    </StyledHeader>
    {isDefined(children) && <StyledBody>{children}</StyledBody>}
  </StyledCard>
);
