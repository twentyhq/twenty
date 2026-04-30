import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CourseData } from '../types/lms.types';

const MOCK_COURSES: CourseData[] = [
  { id: 'CR1', title: 'Data Privacy Fundamentals', description: 'GDPR and local data protection', category: 'Compliance', status: 'published', duration: '2h', enrollmentCount: 180, completionRate: 85, isMandatory: true },
  { id: 'CR2', title: 'Sales Methodology', description: 'MEDDIC framework training', category: 'Sales', status: 'published', duration: '4h', enrollmentCount: 45, completionRate: 62, isMandatory: false },
  { id: 'CR3', title: 'CRM Advanced Features', description: 'Power user training', category: 'Product', status: 'published', duration: '3h', enrollmentCount: 92, completionRate: 48, isMandatory: false },
  { id: 'CR4', title: 'Cybersecurity Awareness', description: 'Annual security training', category: 'Compliance', status: 'published', duration: '1.5h', enrollmentCount: 200, completionRate: 91, isMandatory: true },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCourseTitle = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${themeCssVariables.color.turquoise};
  border-radius: 3px;
`;

const StyledMandatory = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  background: ${themeCssVariables.color.orange};
  color: ${themeCssVariables.font.color.inverted};
  align-self: flex-start;
`;

export const CourseCatalog = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Course Catalog`}</StyledTitle>
      <StyledGrid>
        {MOCK_COURSES.map((course) => (
          <StyledCard key={course.id}>
            {course.isMandatory && <StyledMandatory>{t`Mandatory`}</StyledMandatory>}
            <StyledCourseTitle>{course.title}</StyledCourseTitle>
            <StyledDetail>{course.description}</StyledDetail>
            <StyledRow>
              <span>{course.category}</span>
              <span>{course.duration}</span>
            </StyledRow>
            <StyledRow>
              <span>{course.enrollmentCount} {t`enrolled`}</span>
              <span>{course.completionRate}% {t`completed`}</span>
            </StyledRow>
            <StyledBar>
              <StyledBarFill percent={course.completionRate} />
            </StyledBar>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
