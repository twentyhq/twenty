import styled from '@emotion/styled';

import { useIsMockedDrawerPage } from '@/navigation/hooks/useIsMockedDrawerPage';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerSectionTitleSkeletonLoader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitleSkeletonLoader';

type NavigationDrawerSectionTitleProps = {
  label: string;
};

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-top: 0;
`;

export const NavigationDrawerSectionTitle = ({
  label,
}: NavigationDrawerSectionTitleProps) => {
  const loading = useIsPrefetchLoading();
  const isMockedDrawerPage = useIsMockedDrawerPage();

  const displayLoader = loading && !isMockedDrawerPage;

  if (displayLoader) {
    return <NavigationDrawerSectionTitleSkeletonLoader />;
  }
  return <StyledTitle>{label}</StyledTitle>;
};
