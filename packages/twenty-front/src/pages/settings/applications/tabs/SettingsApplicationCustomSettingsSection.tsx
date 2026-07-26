import { Suspense, lazy } from 'react';
import { Section } from 'twenty-ui/layout';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

type SettingsApplicationCustomSettingsSectionProps = {
  frontComponentId: string;
};

export const SettingsApplicationCustomSettingsSection = ({
  frontComponentId,
}: SettingsApplicationCustomSettingsSectionProps) => {
  return (
    <Section>
      <Suspense fallback={null}>
        <FrontComponentRenderer frontComponentId={frontComponentId} />
      </Suspense>
    </Section>
  );
};
