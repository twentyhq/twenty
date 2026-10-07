import { Skeleton } from 'twenty-ui/primitives/feedback';
import { Section } from 'twenty-ui/components/layout';

export const UsageSectionSkeleton = () => {
  return (
    <Section.Root>
      <Skeleton width={160} height={16} />
      <Skeleton
        width="100%"
        height={200}
        borderRadius={8}
        style={{ marginTop: 16 }}
      />
    </Section.Root>
  );
};
