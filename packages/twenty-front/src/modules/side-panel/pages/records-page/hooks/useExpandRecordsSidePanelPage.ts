import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableRecordsObjectMetadataIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsObjectMetadataIdComponentState';
import { viewableRecordsViewIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsViewIdComponentState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useExpandRecordsSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();
    const navigate = useNavigateApp();
    const { closeSidePanelMenu } = useSidePanelMenu();

    const viewableRecordsObjectMetadataId = useAtomComponentStateValue(
      viewableRecordsObjectMetadataIdComponentState,
    );

    const viewableRecordsViewId = useAtomComponentStateValue(
      viewableRecordsViewIdComponentState,
    );

    const objectMetadataItemsByIdMap = useAtomStateValue(
      objectMetadataItemsByIdMapSelector,
    );

    const objectMetadataItem = isDefined(viewableRecordsObjectMetadataId)
      ? objectMetadataItemsByIdMap.get(viewableRecordsObjectMetadataId)
      : undefined;

    if (
      !isDefined(objectMetadataItem) ||
      !isNonEmptyString(viewableRecordsViewId)
    ) {
      return null;
    }

    return {
      label: t`Expand view`,
      hasExpandShortcut: true,
      expand: () => {
        navigate(
          AppPath.RecordIndexPage,
          { objectNamePlural: objectMetadataItem.namePlural },
          { viewId: viewableRecordsViewId },
        );

        void closeSidePanelMenu();
      },
    };
  };
