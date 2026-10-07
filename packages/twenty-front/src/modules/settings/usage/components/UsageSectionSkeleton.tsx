import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { Section } from 'twenty-ui/components/layout';

export const UsageSectionSkeleton = () => {
  return (
    <Section.Root>
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        borderRadius={4}
        width={160}
        height={16}
      />
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        width="100%"
        height={200}
        borderRadius={8}
        style={{ marginTop: 16 }}
      />
    </Section.Root>
  );
};
