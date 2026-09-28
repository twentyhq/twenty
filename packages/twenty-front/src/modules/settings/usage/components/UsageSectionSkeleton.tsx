import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Section } from 'twenty-ui/components';
import { useTheme } from 'twenty-ui/theme';

export const UsageSectionSkeleton = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Section.Root>
        <Skeleton width={160} height={16} />
        <Skeleton
          width="100%"
          height={200}
          borderRadius={8}
          style={{ marginTop: 16 }}
        />
      </Section.Root>
    </SkeletonTheme>
  );
};
