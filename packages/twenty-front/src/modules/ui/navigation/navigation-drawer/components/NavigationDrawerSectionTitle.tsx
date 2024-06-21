import styled from '@emotion/styled';

import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerSectionTitleSkeletonLoader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitleSkeletonLoader';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type NavigationDrawerSectionTitleProps = {
  onClick?: () => void;
  label: string;
};

const StyledTitle = styled.div<{ onClick?: () => void }>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(1)};

  ${({ onClick, theme }) =>
    !isUndefinedOrNull(onClick)
      ? `&:hover {
          cursor: pointer;
          background-color:${theme.background.transparent.light};
        }`
      : ''}
`;

export const NavigationDrawerSectionTitle = ({
  onClick,
  label,
}: NavigationDrawerSectionTitleProps) => {
  const loading = useIsPrefetchLoading();

  if (loading) {
    return <NavigationDrawerSectionTitleSkeletonLoader />;
  }
  return <StyledTitle onClick={onClick}>{label}</StyledTitle>;
};
