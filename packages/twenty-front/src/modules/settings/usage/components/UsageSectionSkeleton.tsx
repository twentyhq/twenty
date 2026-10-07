import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';

import { Section } from 'twenty-ui/components/layout';

export const UsageSectionSkeleton = () => {
  return (
    <Section.Root>
      <SkeletonLine width={160} height={16} />
      <SkeletonLine
        width="100%"
        height={200}
        borderRadius={8}
        style={{ marginTop: 16 }}
      />
    </Section.Root>
  );
};
