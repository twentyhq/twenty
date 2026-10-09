import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { type ReactNode, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type PageLayoutSidePanelTargetProviderProps = {
  pageLayoutId: string;
  targetRecordIdentifier: TargetRecordIdentifier | undefined;
  children: ReactNode;
};

export const PageLayoutSidePanelTargetProvider = ({
  pageLayoutId,
  targetRecordIdentifier,
  children,
}: PageLayoutSidePanelTargetProviderProps) => {
  const targetRecordId = targetRecordIdentifier?.id;
  const targetObjectNameSingular =
    targetRecordIdentifier?.targetObjectNameSingular;

  const pageLayoutSidePanelTarget = useMemo(
    () =>
      isDefined(targetRecordId) && isDefined(targetObjectNameSingular)
        ? {
            pageLayoutId,
            targetRecordIdentifier: {
              id: targetRecordId,
              targetObjectNameSingular,
            },
          }
        : null,
    [pageLayoutId, targetRecordId, targetObjectNameSingular],
  );

  return (
    <PageLayoutSidePanelTargetContext.Provider
      value={pageLayoutSidePanelTarget}
    >
      {children}
    </PageLayoutSidePanelTargetContext.Provider>
  );
};
