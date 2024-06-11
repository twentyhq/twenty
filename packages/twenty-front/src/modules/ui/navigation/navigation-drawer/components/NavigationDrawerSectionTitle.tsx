import styled from '@emotion/styled';

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

  if (loading) {
    return <NavigationDrawerSectionTitleSkeletonLoader />;
  }
  return <StyledTitle>{label}</StyledTitle>;
};
