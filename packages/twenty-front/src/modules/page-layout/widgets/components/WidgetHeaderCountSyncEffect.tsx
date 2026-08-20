import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';

type WidgetHeaderCountSyncEffectProps = {
  count?: number;
  pageLayoutInstanceId: string;
  widgetInstanceId: string;
};

export const WidgetHeaderCountSyncEffect = ({
  count,
  pageLayoutInstanceId,
  widgetInstanceId,
}: WidgetHeaderCountSyncEffectProps) => {
  const setWidgetHeaderCount = useSetAtomComponentFamilyState(
    widgetHeaderCountComponentFamilyState,
    widgetInstanceId,
    pageLayoutInstanceId,
  );

  useEffect(() => {
    setWidgetHeaderCount(count ?? null);
  }, [count, setWidgetHeaderCount]);

  useEffect(() => {
    return () => {
      setWidgetHeaderCount(null);
    };
  }, [setWidgetHeaderCount]);

  return null;
};
