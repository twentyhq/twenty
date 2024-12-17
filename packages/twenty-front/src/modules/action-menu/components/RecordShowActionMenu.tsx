import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { RecordAgnosticActionsSetterEffect } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionsSetterEffect';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordShowActionMenuButtons } from '@/action-menu/components/RecordShowActionMenuButtons';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { RecordShowPageBaseHeader } from '~/pages/object-record/RecordShowPageBaseHeader';

export const RecordShowActionMenu = ({
  isFavorite,
  record,
  objectMetadataItem,
  objectNameSingular,
  handleFavoriteButtonClick,
}: {
  isFavorite: boolean;
  record: ObjectRecord | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectNameSingular: string;
  handleFavoriteButtonClick: () => void;
}) => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  // TODO: refactor RecordShowPageBaseHeader to use the context store

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: false,
            onActionExecutedCallback: () => {},
          }}
        >
          {isPageHeaderV2Enabled ? (
            <RecordShowActionMenuButtons />
          ) : (
            <RecordShowPageBaseHeader
              {...{
                isFavorite,
                record,
                objectMetadataItem,
                objectNameSingular,
                handleFavoriteButtonClick,
              }}
            />
          )}
          <ActionMenuConfirmationModals />
          <RecordActionMenuEntriesSetter />
          {isWorkflowEnabled && <RecordAgnosticActionsSetterEffect />}
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
