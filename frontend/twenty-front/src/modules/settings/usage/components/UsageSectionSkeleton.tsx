import { useContext } from 'react';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Section } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const UsageSectionSkeleton = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Section>
        <Skeleton width={160} height={16} />
        <Skeleton
          width="100%"
          height={200}
          borderRadius={8}
          style={{ marginTop: 16 }}
        />
      </Section>
    </SkeletonTheme>
  );
};
