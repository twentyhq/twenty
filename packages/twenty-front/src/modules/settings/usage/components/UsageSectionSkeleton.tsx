import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';

import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

export const UsageSectionSkeleton = () => {
  return (
    <Section.Root>
      <SkeletonLine width={160} height={16} />
      <SkeletonLine
        width="100%"
        height={200}
        borderRadius={themeCssVariables.border.radius.mdRound}
        style={{ marginTop: 16 }}
      />
    </Section.Root>
  );
};
