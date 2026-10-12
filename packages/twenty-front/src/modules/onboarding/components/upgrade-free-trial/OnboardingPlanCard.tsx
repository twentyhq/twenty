import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isValidElement, type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Radio } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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

const StyledHeader = styled.label<{ hasBody: boolean; hasNote: boolean }>`
  background-color: transparent;
  border: none;
  border-bottom: ${({ hasBody }) =>
    hasBody ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${({ hasNote }) =>
    hasNote
      ? `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]}`
      : themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitleContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitleText = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1 0 auto;
  flex-wrap: wrap;
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
  width: ${themeCssVariables.spacing[6]};
`;

const StyledTags = styled.span`
  display: contents;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

type OnboardingPlanCardProps = {
  title: string;
  titleSuffix?: string;
  tags?: ReactNode;
  note?: string;
  badge?: string;
  value: boolean;
  children?: ReactNode;
};

export const OnboardingPlanCard = ({
  title,
  titleSuffix,
  tags,
  note,
  badge,
  value,
  children,
}: OnboardingPlanCardProps) => {
  const titleId = useId();
  const noteId = useId();
  const tagsId = useId();
  const hasBody = isValidElement(children);
  const hasNote = isDefined(note);
  const hasTags = isDefined(tags);
  const describedByIds = [hasTags ? tagsId : null, hasNote ? noteId : null]
    .filter(isDefined)
    .join(' ');

  return (
    <StyledCard>
      <StyledHeader hasBody={hasBody} hasNote={hasNote}>
        <StyledTitleRow>
          <StyledTitleContent>
            <StyledTitleText>
              <StyledTitle id={titleId}>{title}</StyledTitle>
              {isDefined(titleSuffix) && (
                <StyledTitleSuffix isEmphasized={hasNote}>
                  {titleSuffix}
                </StyledTitleSuffix>
              )}
            </StyledTitleText>
            {hasTags && <StyledTags id={tagsId}>{tags}</StyledTags>}
            {isDefined(badge) && <StyledBadge>{badge}</StyledBadge>}
          </StyledTitleContent>
          <StyledRadioContainer>
            <Radio
              value={value}
              aria-labelledby={titleId}
              aria-describedby={
                isNonEmptyString(describedByIds) ? describedByIds : undefined
              }
            />
          </StyledRadioContainer>
        </StyledTitleRow>
        {hasNote && <StyledNote id={noteId}>{note}</StyledNote>}
      </StyledHeader>
      {hasBody && <StyledBody>{children}</StyledBody>}
    </StyledCard>
  );
};
