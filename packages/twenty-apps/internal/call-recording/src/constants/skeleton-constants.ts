import styled from '@emotion/styled';

export const SKELETON_BASE_COLOR = '#f0f1f3';
export const SKELETON_HIGHLIGHT_COLOR = '#f8f9fb';

export const StyledSummarySkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 24px;
  width: 100%;
  box-sizing: border-box;
`;

export const StyledViewerSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;
