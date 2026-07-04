import { styled } from '@linaria/react';
import { isValidElement, type ReactNode } from 'react';
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

const StyledHeader = styled.button<{ hasBody: boolean; hasNote: boolean }>`
  align-items: center;
  background-color: transparent;
  border: none;
  border-bottom: ${({ hasBody }) =>
    hasBody ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${({ hasNote }) =>
    hasNote
      ? `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]}`
      : themeCssVariables.spacing[3]};
  position: relative;
  text-align: left;
  width: 100%;
`;

const StyledHeaderLeft = styled.div<{ hasNote: boolean }>`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
  padding-right: ${({ hasNote }) =>
    hasNote ? themeCssVariables.spacing[8] : '0'};
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
  line-height: 1.4;
`;

const StyledTitleSuffix = styled.span<{ isEmphasized: boolean }>`
  color: ${({ isEmphasized }) =>
    isEmphasized
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.extraLight};
  font-size: ${({ isEmphasized }) =>
    isEmphasized
      ? themeCssVariables.font.size.md
      : themeCssVariables.font.size.sm};
  font-weight: ${({ isEmphasized }) =>
    isEmphasized
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledNote = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledBadge = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.grayScale.gray3};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  corner-shape: round;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[5]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledRadioContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
  width: ${themeCssVariables.spacing[6]};
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
}: OnboardingPlanCardProps) => {
  const hasBody = isValidElement(children);
  const hasNote = isDefined(note);

  return (
    <StyledCard>
      <StyledHeader
        type="button"
        hasBody={hasBody}
        hasNote={hasNote}
        onClick={onSelect}
      >
        <StyledHeaderLeft hasNote={hasNote}>
          <StyledTitleRow>
            <StyledTitle>{title}</StyledTitle>
            {isDefined(titleSuffix) && (
              <StyledTitleSuffix isEmphasized={hasNote}>
                {titleSuffix}
              </StyledTitleSuffix>
            )}
          </StyledTitleRow>
          {hasNote && <StyledNote>{note}</StyledNote>}
        </StyledHeaderLeft>
        {hasNote ? (
          <StyledRadioContainer>
            <Radio checked={selected} />
          </StyledRadioContainer>
        ) : (
          <StyledHeaderRight>
            {isDefined(badge) && <StyledBadge>{badge}</StyledBadge>}
            <Radio checked={selected} />
          </StyledHeaderRight>
        )}
      </StyledHeader>
      {hasBody && <StyledBody>{children}</StyledBody>}
    </StyledCard>
  );
};
