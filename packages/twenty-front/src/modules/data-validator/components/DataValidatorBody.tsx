import styled from '@emotion/styled';

import { useJustusTruthStats } from '@/data-validator/hooks/useJustusTruthStats';

import { DataValidatorTopicCard } from './DataValidatorTopicCard';

import { IconBrain } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledIntro = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  width: 100%;
`;

export const DataValidatorBody = () => {
  const { total, reviewedCount, progressPercent, loading } =
    useJustusTruthStats();

  return (
    <StyledContainer>
      <StyledIntro>Select a dataset to validate</StyledIntro>
      <StyledGrid>
        <DataValidatorTopicCard
          title="Justus Truths"
          description="Review knowledge statements extracted from Justus's content"
          Icon={IconBrain}
          to="/data-validator/justus-truths"
          totalCount={total}
          reviewedCount={reviewedCount}
          progressPercent={progressPercent}
          loading={loading}
        />
        <DataValidatorTopicCard
          title="More coming soon"
          description="Additional validation topics will be added here"
          comingSoon
        />
      </StyledGrid>
    </StyledContainer>
  );
};
