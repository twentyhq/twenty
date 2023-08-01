import styled from '@emotion/styled';

import { rgba } from '@/ui/theme/constants/colors';

const Container = styled.div<FadingWrapperProps>`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  grid-column: ${(props: { gridColumn: string }) => props.gridColumn};
  grid-row: ${(props: { gridRow: string }) => props.gridRow};
  pointer-events: none;
`;

const GradientOverlay = styled.div<FadingWrapperProps>`
  background: ${({ theme }) =>
    `linear-gradient(0deg, ${rgba(theme.background.primary, 1)} 0%, ${rgba(
      theme.background.primary,
      0,
    )} 100%)`};
  grid-column: ${(props: { gridColumn: string }) => props.gridColumn};
  grid-row: ${(props: { gridRow: string }) => props.gridRow};
  pointer-events: none;
`;

type FadingWrapperProps = {
  gridColumn: string;
  gridRow: string;
};

export const FadingWrapper = ({ gridColumn, gridRow }: FadingWrapperProps) => (
  <>
    <Container gridColumn={gridColumn} gridRow={gridRow} />
    <GradientOverlay gridColumn={gridColumn} gridRow={gridRow} />
  </>
);
