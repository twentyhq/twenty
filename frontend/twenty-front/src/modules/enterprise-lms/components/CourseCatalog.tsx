import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CourseData } from '../types/lms.types';
import { GET_LMS_DATA } from '../hooks/useLMS';

const StyledContainer = styled.div`
  display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]};
`;
const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0;
`;
const StyledGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: ${themeCssVariables.spacing[3]};
  @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr; }
`;
const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px; display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]};
`;
const StyledCourseTitle = styled.span`
  font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary};
`;
const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary};
`;
const StyledRow = styled.div`
  display: flex; justify-content: space-between; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary};
`;
const StyledBar = styled.div`
  height: 6px; border-radius: 3px; background: ${themeCssVariables.background.transparent.medium}; overflow: hidden;
`;
const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%; width: ${({ percent }) => percent}%; background: ${themeCssVariables.color.turquoise}; border-radius: 3px;
`;
const StyledMandatory = styled.span`
  font-size: ${themeCssVariables.font.size.xs}; padding: 2px 6px; border-radius: 4px;
  background: ${themeCssVariables.color.orange}; color: ${themeCssVariables.font.color.inverted}; align-self: flex-start;
`;

export const CourseCatalog = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_LMS_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const courses: CourseData[] = data?.lmsData ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Course Catalog`}</StyledTitle>
      <StyledGrid>
        {courses.map((course) => (
          <StyledCard key={course.id}>
            {course.isMandatory && <StyledMandatory>{t`Mandatory`}</StyledMandatory>}
            <StyledCourseTitle>{course.title}</StyledCourseTitle>
            <StyledDetail>{course.description}</StyledDetail>
            <StyledRow><span>{course.category}</span><span>{course.duration}</span></StyledRow>
            <StyledRow><span>{course.enrollmentCount} {t`enrolled`}</span><span>{course.completionRate}% {t`completed`}</span></StyledRow>
            <StyledBar><StyledBarFill percent={course.completionRate} /></StyledBar>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
