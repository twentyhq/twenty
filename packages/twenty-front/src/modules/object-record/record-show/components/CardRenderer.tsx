import { type CardConfiguration } from '@/object-record/record-show/types/CardConfiguration';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

// Generic card renderer that handles configuration injection and targetRecord guards
// Works for both cards with configuration and cards without
export const CardRenderer = <T extends CardConfiguration>({
  Component,
  configuration,
}: {
  Component: React.ComponentType<{ configuration?: T }> | React.ComponentType;
  configuration?: T;
}) => {
  const { targetRecord } = useLayoutRenderingContext();

  // Guard: Only render if targetRecord exists (for record page cards)
  if (!targetRecord) {
    return null;
  }

  // TypeScript can't infer if Component accepts configuration prop or not
  // So we cast to the more permissive type and let the component ignore unused props
  const ComponentWithConfig = Component as React.ComponentType<{
    configuration?: T;
  }>;

  return <ComponentWithConfig configuration={configuration} />;
};
